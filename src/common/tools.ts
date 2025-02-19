import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { LAST_PULL_TIME_KEY, REPO_URL_BACKUP } from './constant';


/**
 * Duplicate a file or directory to a new location.
 * 复制文件或文件夹到指定的目录
 * @param sourcePath The path of the source folder or file. 源文件夹或文件的路径.
 * @param destinationPath The path of the target folder. 目标文件夹的路径.
 * @param ignorePathList Provide an array of file paths to ignore. 需要忽略的文件
 * 
 */
export function handleFileCopy(sourcePath: string, destinationPath: string, ignorePathList?: string[]): void {
    if (!fs.existsSync(destinationPath)) {
        // If the destination path does not exist, create it
        fs.mkdirSync(destinationPath, { recursive: true });  // 创建目录
    }
    const lastDir = path.basename(sourcePath);
    destinationPath = path.join(destinationPath, lastDir);
    copyFile(sourcePath, destinationPath, ignorePathList);
};

function copyFile(sourcePath: string, destinationPath: string, ignorePathList?: string[]) {
    // 如果忽略列表中存在该路径，不拷贝
    // If the ignore list contains this path, do not copy
    if (ignorePathList) {
        for (const ignorePath of ignorePathList) {
            if (sourcePath.includes(ignorePath)) {
                return;
            }
        }
    }

    try {
        var stats = fs.statSync(sourcePath);
        // If it is a folder, create it and copy its contents recursively
        // 获取源文件夹内的所有文件和子文件夹
        // Recursively copy the contents of the folder into the destination folder
        // 并递归文件夹内的内容到目标文件夹中
        if (stats.isDirectory()) {
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });  // 创建目录
            }
            // 获取源文件夹内的所有文件和子文件夹
            // Get all files and subfolders
            const files = fs.readdirSync(sourcePath);
            // Recursively copy the contents of the folder into the destination folder
            // 并递归文件夹内的内容到目标文件夹中
            files.forEach((file: string) => {
                const sourceFilePath = path.join(sourcePath, file);
                const targetFilePath = path.join(destinationPath, file);
                copyFile(sourceFilePath, targetFilePath, ignorePathList);
            });
        } else {
            // 如果是文件
            // if it is a file, copy it to the destination folder
            fs.copyFile(sourcePath, destinationPath, () => { });
        }
    } catch (e) {
        console.error(`Failed to copy file: ${sourcePath} -> ${destinationPath}`);
        console.error(e);
        return;
    }

}



/**
 * 拉取模版项目
 * Get the Flutter demo project
 * @param repoUrl the original repo URL. 远程仓库地址.
 * @param demoDir the local folder where the project will be stored. 本地存储文件夹名称.
 */
export async function getGithub(repoUrl: string, demoDir: string, context: vscode.ExtensionContext): Promise<void> {
    const tempDir = path.resolve(__dirname, demoDir);
    try {
        const pubspacePath = path.join(tempDir, 'pubspec.yaml');
        if (!fs.existsSync(pubspacePath)) {
            console.log('开始克隆项目...');
            // 克隆项目
            // git clone 
            fs.mkdirSync(tempDir, { recursive: true });
            // 弹出加载框
            // Pop up the loading box.
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Flutter Project Forge: git clone flutter_normal_demo ...',
                },
                async (_, __) => {
                    execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
                    return 'Flutter Project Forge: git clone completed!';
                }
            ).then((result) => {
                // 弹出任务完成后的提示
                // Show the task completion message.
                vscode.window.showInformationMessage(result);
            });
            const timestamp = Date.now();
            context.globalState.update(LAST_PULL_TIME_KEY, timestamp);
            console.log('克隆完成...', timestamp);
        } else {
            // 检查是否需要更新
            // Check if the project needs to be updated.
            const lasttime: number = context.globalState.get(LAST_PULL_TIME_KEY,) ?? 0;
            const now = Date.now();
            if (lasttime > now - 1000 * 60 * 60 * 24 * 2) {
                console.log('2天内拉取过代码，无需更新...', lasttime);
                return;
            }
            console.log('检查更新...', lasttime);
            // 获取本地项目的最新版本号
            // Get the local project's latest version number
            const localHash = execSync(`git -C ${tempDir} rev-parse HEAD`).toString().trim();
            // 获取远程仓库的最新版本号
            // Get the remote project's latest version number
            const remoteHash = execSync(`git ls-remote ${repoUrl} HEAD`).toString().split('\t')[0].trim();
            if (localHash !== remoteHash) {
                console.log('版本号不同，开始拉取更新...');
                execSync(`git -C ${tempDir} pull`, { stdio: 'inherit' });
            } else {
                console.log('版本号相同，无需更新。');
            }
            context.globalState.update(LAST_PULL_TIME_KEY, now);
        }
    } catch (error) {
        console.log('拉取项目失败...');
        console.log(error);
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (REPO_URL_BACKUP === repoUrl) {
            vscode.window.showErrorMessage("Flutter Project Forge: NETWORK ERROR");
        } else {
            // 从备份仓库再拉一次
            // Get the project from the backup repository
            console.log('从备份仓库再拉一次...');
            getGithub(REPO_URL_BACKUP, demoDir, context);
        }
    }
}
/**
 * 处理page name 为文件或文件夹名称
 * handle page name to file name or folder name
 * @param pageName the page name entered by the user. 用户输入的page name
 */
export function handlePageFileName(pageName: string): string {
    if (!pageName) { return pageName; }
    pageName.replaceAll(/\//g, '');
    pageName = cutEnd(pageName);
    // 使用正则表达式替换大写字母，并在其前加上下划线
    // Use regular expression to replace uppercase letters, and add an underscore before them
    const result = pageName.replace(/([A-Z])/g, '_$1').toLowerCase();
    return result;
}

/**
 * 处理page name 为类名
 * Handle page name to class name
 * @param pageName 
 */
export function handlePageName(pageName: string): string {
    if (!pageName) { return pageName; }
    pageName.replaceAll(/\//g, '');
    pageName = cutEnd(pageName);
    const words = pageName.split(/[-_]/);
    return words.map(capitalizeWord).join('') + 'Page';
}

function capitalizeWord(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function cutEnd(fileName: string): string {
    return fileName.replace(/(\.dart|page\.dart|page|_page|_page.dart|Page\.dart|Page)$/, '');
}

/**
 * 写入文件到指定文件
 * entered content to the specified file
 * @param content the content to be written to the file
 * @param destinationPath target file path
 * @param fileName the file name (optional)
 */
export function writeContentToFile(content: string, destinationPath: string, fileName?: string | undefined): void {
    if (fileName) {
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });  // 创建目录
        }
        const filePath = path.join(destinationPath, fileName);
        fs.writeFileSync(filePath, content, 'utf8');
    } else {
        fs.writeFileSync(destinationPath, content, 'utf8');
    }
}


/**
 * 获取当前文件的
 * Get the current file's directory
 * @param targetFilePath target file path or directory path. 文件或文件夹路径
 * @returns file's directory. 文件夹的路径
 */
export function getCurrentDir(targetFilePath: string): string {
    var stats = fs.statSync(targetFilePath);
    if (stats.isFile()) {
        targetFilePath = path.dirname(targetFilePath);
    }
    return targetFilePath;
}



/**
 * 追加内容到文件末尾
 * push content to the end of the file
 * @param file file path. 文件路径
 * @param content the content to be added. 要添加的内容
 * @param isObject Optional. Whether it needs to be added within curly braces. default:false. 可选，是否需要添加到大括号内，默认为false
 * @param createFile  Optional. Automatically create the file if it doesn't exist. default:true. 可选，文件不存在自动创建文件，默认为true
 **/
export function pushToEnd(file: string, content: string, isObject: boolean = false, createFile: boolean = true): void {
    if (fs.existsSync(file)) {
        // 读取文件，追加内容
        // Read content from the file, and append content if not exists
        let fileContent = fs.readFileSync(file, 'utf-8');
        if (!fileContent.includes(content)) {
            if (isObject) {
                fileContent = fileContent.replaceAll('}', `  ${content}` + '\n}\n');
            } else {
                fileContent += '\n' + content;
            }
            writeContentToFile(fileContent, file);
        }
    } else {
        if (createFile) { writeContentToFile(content, file); }
    }
}