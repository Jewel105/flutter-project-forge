
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR } from './constant';
import { handleFileCopy } from './tools';

/**
 * 判断项目是否是flutter项目
 * @param flutterRootPath 项目根目录
 * @returns {boolean} true if is flutter project, false otherwise.
 */
function isFlutterProject(flutterRootPath: string | undefined): boolean {
  console.log('rootPath', flutterRootPath);
  if (!flutterRootPath) { return false; }
  // 判断项目是否是flutter项目
  if (!fs.existsSync(path.join(flutterRootPath, 'pubspec.yaml'))) {
    console.error('This is not a Flutter project.');
    vscode.window.showErrorMessage('This is not a Flutter project. Please open a Flutter project first.');
    return false;
  }
  return true;
}
/**
 * 获取当前项目的根目录，多个工作区时，需要获取准确的路径
 * @param targetFilePath 当前右键的文件夹路径
 */
function getProjectRoot(targetFilePath: string | undefined): string | undefined {
  if (!targetFilePath) { // 如果没有传入路径，则获取第一个工作区的根路径
    const rootPath = vscode.workspace.workspaceFolders?.at(0)?.uri.path;
    return rootPath;
  }
  // 获取当前项目的根路径
  const rootPathList = vscode.workspace.workspaceFolders?.map(e => e.uri.path);
  let rootPath = rootPathList?.find(e => targetFilePath.includes(e));
  return rootPath;
}


/**
 * 快速创建项目demo
 */
export function createFlutterDemo(uri: vscode.Uri): void {
  const rootPath = getProjectRoot(uri.path);
  if (!isFlutterProject(rootPath)) { return; }
  try {
    // lib
    const libSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, 'lib');
    handleFileCopy(libSourcePath, rootPath!);
    // .vscode
    const vscodeConfigSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, '.vscode');
    handleFileCopy(vscodeConfigSourcePath, rootPath!);
    // l10n.yaml
    const l10nSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, 'l10n.yaml');
    handleFileCopy(l10nSourcePath, rootPath!);
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage('Failed to copy extensions.dart to the project root.');
  }
}


/**
 * 生成dio网络请求
 */
export function createDioRequest(uri: vscode.Uri): void {
  const rootPath = getProjectRoot(uri.path);
  if (!isFlutterProject(rootPath)) { return; }

  try {
    // lib
    const libSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, 'lib', 'core', 'http');
    const destinationLibPath = path.join(rootPath!, 'lib', 'core');
    handleFileCopy(libSourcePath, destinationLibPath);
    // api
    const apiPath = path.join(__dirname, FLUTTER_DEMO_DIR, 'lib', 'core', 'api');
    const destinationApiPath = path.join(rootPath!, 'lib', 'core');
    handleFileCopy(apiPath, destinationApiPath);
    // constant
    const appConstantPath = path.join(__dirname, FLUTTER_DEMO_DIR, 'lib', 'core', 'app', 'app_constant.dart');
    const destinationConstantPath = path.join(rootPath!, 'lib', 'core', 'app');
    handleFileCopy(appConstantPath, destinationConstantPath);
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage('Failed to copy http to the project root.');
  }
}

/**
 * 生成sqllite文件
 */
export function createSqlRequest(uri: vscode.Uri): void {
  const rootPath = getProjectRoot(uri.path);
  if (!isFlutterProject(rootPath)) { return; }
  try {
    // lib
    const libSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, 'lib', 'core', 'db');
    const destinationLibPath = path.join(rootPath!, 'lib', 'core');
    handleFileCopy(libSourcePath, destinationLibPath);
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage('Failed to copy database to the project root.');
  }
}
/**
 * 创建页面
 */
export function createPage(uri: vscode.Uri): void {
  const rootPath = getProjectRoot(uri.path);
  if (!isFlutterProject(rootPath)) { return; }
}
