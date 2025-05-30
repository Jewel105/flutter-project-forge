
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { FLUTTER_DEMO_DIR } from './constant';
import { getCurrentDir, handleFileCopy, handlePageFileName, handlePageName, pushToEnd, writeContentToFile } from './tools';

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
    // 忽略数据库文件
    handleFileCopy(libSourcePath, rootPath!, [path.join('lib', 'core', 'db')]);
    // .vscode
    const vscodeConfigSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, '.vscode');
    handleFileCopy(vscodeConfigSourcePath, rootPath!);
    // l10n.yaml
    const l10nSourcePath = path.join(__dirname, FLUTTER_DEMO_DIR, 'l10n.yaml');
    handleFileCopy(l10nSourcePath, rootPath!);
    // scan info.plist 增加权限
    scanInfoPlist(rootPath!);
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
    const projectConstantPath = path.join(rootPath!, 'lib', 'core', 'app', 'app_constant.dart');
    const demoConstantContent = 'static const String TOKEN = "token";';
    pushToEnd(projectConstantPath, demoConstantContent, true);
    // index.dart
    const appIndexPath = path.join(rootPath!, 'lib', 'core', 'app', 'index.dart');
    const demoIndexContent = "export 'app_constant.dart';";
    pushToEnd(appIndexPath, demoIndexContent);
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage('Failed to copy http to the project root.');
  }
}

/**
 * 生成sqllite文件
 */
export function createSql(uri: vscode.Uri): void {
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
export async function createPage(uri: vscode.Uri): Promise<void> {
  try {
    let targetDirPath = getCurrentDir(uri.path);
    const rootPath = getProjectRoot(targetDirPath);
    if (!isFlutterProject(rootPath)) { return; }
    // 等待用户输入
    const pageName = await input("Please Enter Page Name", "login");
    if (!pageName) { return; }
    const fileName = handlePageFileName(pageName);
    const pageClass = handlePageName(pageName);
    // 检查targetFilePath是否包含page目录
    targetDirPath = addPage(rootPath, targetDirPath, fileName, pageClass);
    // 修改route_config
    editRouteConfig(rootPath, targetDirPath, fileName, pageClass);
  } catch (err) {
    vscode.window.showErrorMessage(`${err}`);
    return;
  }
}

/**
 * 修改路由配置
 */
function editRouteConfig(rootPath: string | undefined, targetDirPath: string, fileName: string, pageClass: string) {
  const routeConfigPath = path.join(rootPath!, 'lib', 'core', 'router', 'route_config.dart');
  var routeConfigContent = fs.readFileSync(routeConfigPath, 'utf-8');
  var importDir = targetDirPath.match(/page.*/) ?? [];
  var newImportString = `.dart';\n\nimport '../../${importDir}/${fileName}_page.dart';\n`;
  var newImportContent = routeConfigContent.replace(".dart';\n", newImportString);
  var newPageString = `    '/${fileName}': (Object? arguments) => const ${pageClass}(),\n  };\n`;
  var newContent = newImportContent.replace("  };\n", newPageString);
  fs.writeFileSync(routeConfigPath, newContent, 'utf8');
}

/**
 * 新增页面
 */
function addPage(rootPath: string | undefined, targetDirPath: string, fileName: string, pageClass: string) {
  const pageDir = path.join(rootPath!, 'lib', 'page');
  if (!targetDirPath.includes(pageDir)) {
    targetDirPath = path.join(pageDir, fileName);
  }
  // 添加page文件
  const demoPagePath = path.join(__dirname, FLUTTER_DEMO_DIR, 'lib', 'page', 'demo', 'demo_page.dart');
  let demoPageContent = fs.readFileSync(demoPagePath, 'utf-8');
  // 替换文件
  demoPageContent = demoPageContent.replaceAll('DemoPage', pageClass);
  writeContentToFile(demoPageContent, targetDirPath, `${fileName}_page.dart`);
  return targetDirPath;
}

/**
 * 用户输入框
 * @param content 用户输入的page name
 * @param destinationPath 目标目录
 * @returns string 用户输入
 */
async function input(prompt: string, placeHolder: string): Promise<string | undefined> {
  const namePromptOptions: vscode.InputBoxOptions = {
    prompt: prompt,
    placeHolder: placeHolder,
  };
  const pageName = await vscode.window.showInputBox(namePromptOptions);
  if (!pageName) {
    vscode.window.showErrorMessage('Please enter a page name.');
    return;
  }
  return pageName;
}

/**
 * 添加扫码权限到ios Info.plist文件下
 * @param rootPath 项目根目录
 */
function scanInfoPlist(rootPath: string) {
  const infoPath = path.join(rootPath, 'ios', 'Runner', 'Info.plist');
  var infoContent = fs.readFileSync(infoPath, 'utf-8');
  let cameraInfo = infoContent.includes('<key>NSCameraUsageDescription</key>');
  let photoInfo = infoContent.includes('<key>NSPhotoLibraryUsageDescription</key>');
  var newString = `${cameraInfo ? '' : `  <key>NSCameraUsageDescription</key>
	<string>This app needs camera access to scan QR codes</string>`} 
  ${photoInfo ? '' : `<key>NSPhotoLibraryUsageDescription</key>
	<string>This app needs photos access to get QR code from photo library</string>`} 
</dict>`;
  var newContent = infoContent.replace("</dict>", newString);
  var targetFilePath = path.join(rootPath!, 'ios', 'Runner', 'Info.plist');
  writeContentToFile(newContent, targetFilePath);
}