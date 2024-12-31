import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { LAST_PULL_TIME_KEY, REPO_URL_BACKUP } from './constant';


/**
 * 复制文件或文件夹到指定的目录
 * @param sourcePath 源文件夹或文件的路径.
 * @param destinationPath 目标文件夹的路径.
 */
export function handleFileCopy(sourcePath: string, destinationPath: string) {
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });  // 创建目录
    }
    const lastDir = path.basename(sourcePath);
    destinationPath = path.join(destinationPath, lastDir);
    copyFile(sourcePath, destinationPath);
};

function copyFile(sourcePath: string, destinationPath: string) {
    try {
        var stats = fs.statSync(sourcePath);

        // 如果是文件夹
        if (stats.isDirectory()) {
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });  // 创建目录
            }
            // 获取源文件夹内的所有文件和子文件夹
            const files = fs.readdirSync(sourcePath);
            // 递归调用复制文件夹的内容
            files.forEach((file: string) => {
                const sourceFilePath = path.join(sourcePath, file);
                const targetFilePath = path.join(destinationPath, file);
                copyFile(sourceFilePath, targetFilePath);
            });
        } else {
            // 如果是文件
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
 * @param repoUrl 远程仓库地址.
 * @param demoDir 本地存储文件夹名称.
 */
export async function getGithub(repoUrl: string, demoDir: string, context: vscode.ExtensionContext): Promise<void> {
    const tempDir = path.resolve(__dirname, demoDir);
    try {
        const pubspacePath = path.join(tempDir, 'pubspec.yaml');
        if (!fs.existsSync(pubspacePath)) {
            console.log('开始克隆项目...');
            // 克隆项目
            fs.mkdirSync(tempDir, { recursive: true });
            // 弹出加载框
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
                vscode.window.showInformationMessage(result); // 弹出任务完成后的提示
            });
            const timestamp = Date.now();
            context.globalState.update(LAST_PULL_TIME_KEY, timestamp);
            console.log('克隆完成...', timestamp);
        } else {
            // 检查是否需要更新
            const lasttime: number = context.globalState.get(LAST_PULL_TIME_KEY,) ?? 0;
            const now = Date.now();
            if (lasttime > now - 1000 * 60 * 60 * 24 * 3) {
                console.log('3天内拉取过代码，无需更新...', lasttime);
                return;
            }
            console.log('检查更新...', lasttime);
            // 获取本地项目的最新版本号
            const localHash = execSync(`git -C ${tempDir} rev-parse HEAD`).toString().trim();
            // 获取远程仓库的最新版本号
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
            console.log('从备份仓库再拉一次...');
            getGithub(REPO_URL_BACKUP, demoDir, context);
        }
    }
}
/**
 * 处理page name 为文件或文件夹名称
 * @param pageName 用户输入的page name
 */
export function handlePageFileName(pageName: string): string {
    if (!pageName) { return pageName; }
    pageName.replaceAll(/\//g, '');
    pageName = cutEnd(pageName);
    // 使用正则表达式替换大写字母，并在其前加上下划线
    const result = pageName.replace(/([A-Z])/g, '_$1').toLowerCase();
    return result;
}

/**
 * 处理page name 为类名
 * @param pageName 用户输入的page name
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
 * @param content 用户输入的page name
 * @param destinationPath 目标目录或文件
 * @param fileName 文件名称
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
 * @param targetFilePath 文件或文件夹路径
 * @returns 文件夹的路径
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
 * @param file 文件路径
 * @param content 需要追加的内容
 **/
export function pushToEnd(file: string, content: string) {
    if (fs.existsSync(file)) {
        // 读取文件，追加内容
        let fileContent = fs.readFileSync(file, 'utf-8');
        if (!fileContent.includes(content)) {
            fileContent += '\n' + content;
            writeContentToFile(fileContent, file);
        }
    } else {
        writeContentToFile(content, file);
    }
}