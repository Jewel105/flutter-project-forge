import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR, REPO_URL } from './common/constant';
import { createDioRequest, createFlutterDemo, createPage, createSqlRequest } from './common/core';
import { getGithub } from './common/tools';


export function activate(context: vscode.ExtensionContext) {
	// 获取github的模版项目
	getGithub(REPO_URL, FLUTTER_DEMO_DIR, context);

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


	// 创建页面
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.createPage',
		createPage,
	));
}
export function deactivate() { }

