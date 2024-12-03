import path from 'path';
import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR, LIB_DIR, REPO_URL } from './constant';
import { isFlutterProject } from './core';
import { getGithub, handleFileCopy } from './tools';


export function activate(context: vscode.ExtensionContext) {
	// 生产extensions文件
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.extensions', async (uri) => {
		// 当前项目的根路径，只取第一个项目
		const rootPath = vscode.workspace.workspaceFolders?.at(0)?.uri.path;
		if (rootPath) {
			getGithub(REPO_URL, FLUTTER_DEMO_DIR);
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

	// 生成demo项目
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.createFlutterDemo', async (uri) => {
		// 当前项目的根路径，只取第一个项目
		const rootPath = vscode.workspace.workspaceFolders?.at(0)?.uri.path;
		if (!isFlutterProject(rootPath)) { return; }
		// 获取github的模版项目
		getGithub(REPO_URL, FLUTTER_DEMO_DIR);
		try {
			const extensionsSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, LIB_DIR);
			handleFileCopy(extensionsSourcePath, rootPath!);
		} catch (err) {
			console.log(err);
			vscode.window.showErrorMessage('Failed to copy extensions.dart to the project root.');
		}
	}));
}
export function deactivate() { }

