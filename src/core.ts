
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR, REPO_URL } from './constant';
import { getGithub, handleFileCopy } from './tools';

/**
 * 判断项目是否是flutter项目
 * @param flutterRootPath 项目根路径
 * @returns {boolean} true if is flutter project, false otherwise.
 */
function isFlutterProject(flutterRootPath: string | undefined): boolean {
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
 * 快速创建项目demo
 */
export function createFlutterDemo(): void {
  // 当前项目的根路径，只取第一个项目
  const rootPath = vscode.workspace.workspaceFolders?.at(0)?.uri.path;
  if (!isFlutterProject(rootPath)) { return; }
  // 获取github的模版项目
  getGithub(REPO_URL, FLUTTER_DEMO_DIR);
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
export function createDioRequest(): void {
  // 当前项目的根路径，只取第一个项目
  const rootPath = vscode.workspace.workspaceFolders?.at(0)?.uri.path;
  if (!isFlutterProject(rootPath)) { return; }
  // 获取github的模版项目
  getGithub(REPO_URL, FLUTTER_DEMO_DIR);
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