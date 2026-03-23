# vscode-script-runner

一个仅用于本地使用的 VS Code 扩展：当当前 workspace 根目录存在 `package.json` 且包含 `scripts` 时，在编辑器右上角显示运行按钮，点击后用 QuickPick 选择脚本，并在新终端中执行 `npm run <scriptName>`。

## 功能

- 检测当前 workspace 根目录的 `package.json`
- 在编辑器右上角显示运行按钮
- 列出根目录下全部 `scripts`
- 每次运行都创建一个新的终端
- 终端工作目录固定为当前 workspace 根目录

## 本地调试

```bash
npm install
npm run compile
```

然后在这个扩展工程目录里按 `F5`，启动一个新的 Extension Development Host 窗口进行调试。

## 本地打包

```bash
npm run package:vsix
```

打包完成后会在当前目录生成 `vscode-script-runner-0.0.1.vsix`。

在 VS Code 中执行 `Extensions: Install from VSIX...` 即可本地安装。

## 使用方式

1. 用 VS Code 打开一个根目录包含 `package.json` 的前端项目
2. 打开任意代码文件
3. 点击编辑器右上角的运行按钮
4. 选择一个脚本
5. 查看新终端自动执行 `npm run <scriptName>`

## 约束

- v1 只读取 `workspaceFolders[0]`
- v1 固定使用 `npm`
- 如果根目录 `package.json` 不存在、JSON 非法或没有 `scripts`，按钮不会显示
