# VSCode Script Runner

一个轻量的 VS Code 扩展：在编辑器标题栏始终显示运行按钮，支持一键选择并执行工作区根目录 `package.json` 里的 `npm script`。

## 功能特性

- 在编辑器右上角显示 `Run npm Script` 按钮
- 自动读取工作区根目录 `package.json` 的 `scripts`
- QuickPick 列出全部可运行脚本
- 每次执行创建一个新的终端
- 终端工作目录固定为工作区根目录

## 使用方式

1. 用 VS Code 打开任意项目目录（建议根目录包含 `package.json`）。
2. 打开任意文本文件，让编辑器标题栏可见。
3. 点击右上角运行按钮，或在命令面板运行 `Local Scripts Runner: Run npm Script`。
4. 在列表中选择要执行的脚本。
5. 插件会新建终端并执行 `npm run <scriptName>`。

## 命令

- Command ID: `localScriptsRunner.pickAndRunScript`
- Command Title: `Run npm Script`
- Category: `Local Scripts Runner`

## 触发与显示规则

- 扩展在 `onStartupFinished` 后激活。
- 编辑器标题栏按钮在编辑器标题栏可见时始终显示（不依赖焦点）。
- 点击执行时才会校验根目录 `package.json` 是否存在且可解析。

## 开发与调试

### 环境要求

- Node.js 18+
- VS Code 1.110.0+

### 安装依赖并编译

```bash
npm install
npm run compile
```

### 本地调试

在扩展项目中按 `F5`，启动 `Extension Development Host` 窗口调试。

### 持续编译

```bash
npm run watch
```

## 本地打包与安装

```bash
npm run package:vsix
```

产物文件为：

```text
vscode-script-runner-0.0.2.vsix
```

在 VS Code 中执行 `Extensions: Install from VSIX...` 选择该文件即可安装。

## 项目结构

```text
.
├─ src/extension.ts      # 扩展入口与核心逻辑
├─ resources/            # 命令图标资源
├─ out/                  # TypeScript 编译输出
└─ package.json          # VS Code 扩展清单与脚本
```

## 已知限制

- 当前版本仅处理 `workspaceFolders[0]`。
- 当前版本固定使用 `npm` 执行脚本。
- 不支持选择子目录中的 `package.json`。

## License

`UNLICENSED`（仅用于本地/私有场景）。
