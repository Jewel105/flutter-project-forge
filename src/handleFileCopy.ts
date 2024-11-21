import fs from 'fs';
import path from 'path';

// 复制文件或者文件夹
function handleFileCopy(sourcePath: string, destinationPath: string) {
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

export default handleFileCopy;
