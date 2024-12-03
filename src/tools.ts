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
        files.map((file: string) => {
            const sourceFilePath = path.join(sourcePath, file);
            const targetFilePath = path.join(destinationPath, file);
            return copyFile(sourceFilePath, targetFilePath); // 异步调用
        });
    }
    else {
        // 如果是文件
        fs.copyFileSync(sourcePath, destinationPath);
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
        // 克隆项目
        fs.mkdirSync(tempDir, { recursive: true });
        execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
    } else {
        // git pull 更新已有项目
        execSync(`git -C ${tempDir} pull`, { stdio: 'inherit' });
    }
}

