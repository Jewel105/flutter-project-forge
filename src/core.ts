
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

/**
 * 判断项目是否是flutter项目
 * @param flutterRootPath 项目根路径
 * @returns {boolean} true if is flutter project, false otherwise.
 */
export function isFlutterProject(flutterRootPath: string | undefined): boolean {
  if (!flutterRootPath) { return false; }
  // 判断项目是否是flutter项目
  if (!fs.existsSync(path.join(flutterRootPath, 'pubspec.yaml'))) {
    console.error('This is not a Flutter project.');
    vscode.window.showErrorMessage('This is not a Flutter project. Please open a Flutter project first.');
    return false;
  }
  return true;
}