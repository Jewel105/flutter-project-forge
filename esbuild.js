const esbuild = require("esbuild");
const path = require("path");
const fs = require('fs');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');


// 静态文件目录
const staticDir = path.resolve(__dirname, 'static');
// 输出目录
const outputDir = path.resolve(__dirname, 'dist');

// 复制静态文件的函数
function copyStaticFiles() {
    if (!fs.existsSync(staticDir)) {
        console.warn('Static directory does not exist, skipping...');
        return;
    }
    // 创建输出目录（如果不存在）
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
		const staticDist = path.join(outputDir, 'static');
		if (!fs.existsSync(staticDist)) {
			fs.mkdirSync(staticDist, { recursive: true });
		}

    // 遍历并复制静态文件
    fs.readdirSync(staticDir).forEach(file => {
        const srcPath = path.join(staticDir, file);
        const destPath = path.join(staticDist, file);

        if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${file}`);
        }
    });
}
/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
	copyStaticFiles(); 
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
