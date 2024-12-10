import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 复制文件或文件夹到指定的目录
 * @param sourcePath 源文件夹或文件的路径.
 * @param destinationPath 目标文件夹的路径.
 */
export function handleFileCopy(sourcePath: string, destinationPath: string) {
    const lastDir = path.basename(sourcePath);
    destinationPath = path.join(destinationPath, lastDir);
    copyFile(sourcePath, destinationPath);
};

function copyFile(sourcePath: string, destinationPath: string) {
    try {
        var stats = fs.statSync(sourcePath);

        // 如果是文件夹
        if (stats.isDirectory()) {
            // 如果目标文件夹不存在，则创建
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }

            // 获取源文件夹内的所有文件和子文件夹
            const files = fs.readdirSync(sourcePath);

            // 递归调用复制文件夹的内容
            files.forEach((file: string) => {
                const sourceFilePath = path.join(sourcePath, file);
                const targetFilePath = path.join(destinationPath, file);
                copyFile(sourceFilePath, targetFilePath);
            });
        }
        else {
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
export function getGithub(repoUrl: string, demoDir: string): void {
    const tempDir = path.resolve(__dirname, demoDir);
    if (!fs.existsSync(tempDir)) {
        console.log('开始克隆项目...');
        // 克隆项目
        fs.mkdirSync(tempDir, { recursive: true });
        execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
        console.log('克隆完成...');
    } else {
        console.log('检查更新...');
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
    }
}

