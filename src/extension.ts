import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR, REPO_URL } from './constant';
import { createDioRequest, createFlutterDemo, createSqlRequest } from './core';
import { getGithub } from './tools';


export function activate(context: vscode.ExtensionContext) {
	  // 获取github的模版项目
		getGithub(REPO_URL, FLUTTER_DEMO_DIR,context);

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

	// 生成sqllite文件
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.sqlite',
		createSqlRequest,
	));
}
export function deactivate() { }

