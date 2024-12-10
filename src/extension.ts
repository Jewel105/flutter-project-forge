import * as vscode from 'vscode';
import { createDioRequest, createFlutterDemo } from './core';


export function activate(context: vscode.ExtensionContext) {
	// 生成基础demo项目
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.createFlutterDemo',
		createFlutterDemo,
	));

	// 生成dio网络请求
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.http',
		createDioRequest,
	));
}
export function deactivate() { }

