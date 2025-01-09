import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR, REPO_URL } from './common/constant';
import { createDioRequest, createFlutterDemo, createPage, createScan, createSql } from './common/core';
import { getGithub } from './common/tools';


export function activate(context: vscode.ExtensionContext) {
	// 获取github的模版项目
	// Get the Flutter demo project
	getGithub(REPO_URL, FLUTTER_DEMO_DIR, context);

	// 生成基础demo项目
	/*
	* Generate the basic Flutter demo project
	*/
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.createFlutterDemo',
		createFlutterDemo,
	));

	// 生成dio网络请求
	/*
	* Generate a Dio network request
	*/
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.http',
		createDioRequest,
	));

	// 生成sqllite文件
	/*
	* Generate a sqlite file
	*/
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.sqlite',
		createSql,
	));


	// 添加scan页面
	/*
	* Add QR code scanning feature
	*/
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.scan',
		createScan,
	));

	// 创建页面
	/*
  * Create a new page in the current Flutter project.
  */
	context.subscriptions.push(vscode.commands.registerCommand(
		'flutter-project-forge.createPage',
		createPage,
	));
}
export function deactivate() { }

