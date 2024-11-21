import path from 'path';
import * as vscode from 'vscode';
import handleFileCopy from './handleFileCopy';


export function activate(context: vscode.ExtensionContext) {
	// 注册命令
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.helloWorld', async () => {
		var awser = await vscode.window.showInformationMessage('Hello', "good", "bad");
		console.log(awser); // good, bad or undefined if user cancels
	}));

	// 生产extensions文件
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.extensions', async (uri) => {
		// 当前项目的根路径，只取第一个项目
		const rootPath = vscode.workspace.workspaceFolders?.at(0)?.uri.path;
		if (rootPath) {
			const extensionsSourcePath = path.join(__dirname, 'static', "extensions.dart");
			// const destinationPath = path.join(rootPath, 'static'); // 目标路径
			try {
				handleFileCopy(extensionsSourcePath, rootPath);
				// vscode.window.showInformationMessage('extensions.dart has been successfully copied to the project root.');
			} catch (err) {
				console.log(err);
				vscode.window.showErrorMessage('Failed to copy extensions.dart to the project root.');
			}
		} else {
			console.error('No workspace folder found.');
			vscode.window.showErrorMessage('No workspace folder found. Please open a project first.');
		}

		// vscode.workspace.openTextDocument(path.join(__dirname, 'extensions.dart')).then(doc => {
		//     vscode.window.showTextDocument(doc);
		// });
	}));

}
export function deactivate() { } 
