import path from 'path';
import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR, REPO_URL } from './constant';
import { getGithub, handleFileCopy } from './tools';


export function activate(context: vscode.ExtensionContext) {
	// 生产extensions文件
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.extensions', async (uri) => {
		// 当前项目的根路径，只取第一个项目
		const rootPath = vscode.workspace.workspaceFolders?.at(0)?.uri.path;
		if (rootPath) {
			getGithub(REPO_URL,FLUTTER_DEMO_DIR);
			const extensionsSourcePath = path.join(__dirname, 'static', "extensions.dart");
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
	}));

}
export function deactivate() { }

