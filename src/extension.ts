import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

type RootPackageScripts = Record<string, string>;

interface ScriptPickItem extends vscode.QuickPickItem {
  scriptName: string;
  scriptCommand: string;
}

const COMMAND_ID = "localScriptsRunner.pickAndRunScript";
const CONTEXT_KEY = "localScriptsRunner.hasRootPackageJson";

let packageWatcher: vscode.FileSystemWatcher | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const refreshContext = async () => {
    await updatePackageContext();
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_ID, async () => {
      await pickAndRunScript();
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      resetPackageWatcher(refreshContext);
      void refreshContext();
    }),
  );

  resetPackageWatcher(refreshContext);
  await refreshContext();
}

export function deactivate(): void {
  packageWatcher?.dispose();
}

async function pickAndRunScript(): Promise<void> {
  const packageInfo = await readRootPackageInfo();

  if (packageInfo.reason === "no-workspace") {
    void vscode.window.showWarningMessage("未检测到已打开的 workspace。");
    return;
  }

  if (packageInfo.reason === "missing-package") {
    void vscode.window.showWarningMessage("当前 workspace 根目录下没有 package.json。");
    return;
  }

  if (packageInfo.reason === "invalid-package") {
    void vscode.window.showErrorMessage("根目录 package.json 解析失败，请先修复 JSON 格式。");
    return;
  }

  if (packageInfo.reason !== "ok") {
    return;
  }

  const items = toScriptPickItems(packageInfo.scripts);
  if (items.length === 0) {
    void vscode.window.showInformationMessage("根目录 package.json 中没有可运行的 scripts。");
    return;
  }

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: "选择要运行的 npm script",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!picked) {
    return;
  }

  const terminal = vscode.window.createTerminal({
    name: `npm: ${picked.scriptName}`,
    cwd: packageInfo.rootPath,
  });

  terminal.show();
  terminal.sendText(`npm run ${picked.scriptName}`, true);
}

function resetPackageWatcher(refreshContext: () => Promise<void>): void {
  packageWatcher?.dispose();

  const rootPath = getWorkspaceRootPath();
  if (!rootPath) {
    packageWatcher = undefined;
    return;
  }

  packageWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(rootPath, "package.json"),
  );

  packageWatcher.onDidCreate(() => {
    void refreshContext();
  });
  packageWatcher.onDidChange(() => {
    void refreshContext();
  });
  packageWatcher.onDidDelete(() => {
    void refreshContext();
  });
}

async function updatePackageContext(): Promise<void> {
  const packageInfo = await readRootPackageInfo();
  const hasScripts =
    packageInfo.reason === "ok" && Object.keys(packageInfo.scripts).length > 0;

  await vscode.commands.executeCommand("setContext", CONTEXT_KEY, hasScripts);
}

function getWorkspaceRootPath(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

async function readRootPackageInfo(): Promise<
  | {
      reason: "ok";
      rootPath: string;
      scripts: RootPackageScripts;
    }
  | {
      reason: "no-workspace" | "missing-package" | "invalid-package";
      rootPath?: string;
    }
> {
  const rootPath = getWorkspaceRootPath();
  if (!rootPath) {
    return { reason: "no-workspace" };
  }

  const packageJsonPath = path.join(rootPath, "package.json");
  try {
    const raw = await fs.readFile(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw) as { scripts?: unknown };
    const scripts = normalizeScripts(parsed.scripts);

    return {
      reason: "ok",
      rootPath,
      scripts,
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        reason: "missing-package",
        rootPath,
      };
    }

    return {
      reason: "invalid-package",
      rootPath,
    };
  }
}

function normalizeScripts(rawScripts: unknown): RootPackageScripts {
  if (!rawScripts || typeof rawScripts !== "object") {
    return {};
  }

  const entries = Object.entries(rawScripts).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return Object.fromEntries(entries);
}

function toScriptPickItems(scripts: RootPackageScripts): ScriptPickItem[] {
  return Object.entries(scripts).map(([scriptName, scriptCommand]) => ({
    label: scriptName,
    description: scriptCommand,
    detail: `npm run ${scriptName}`,
    scriptName,
    scriptCommand,
  }));
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
