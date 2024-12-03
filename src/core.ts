
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
 * @param rootPath 项目根路径
 */
export function createFlutterDemo(rootPath: string | undefined): void {
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