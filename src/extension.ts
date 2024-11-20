import path from 'path';
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
	// 注册命令
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.helloWorld', async () => {
		var awser = await vscode.window.showInformationMessage('Hello', "good", "bad");
		console.log(awser); // good, bad or undefined if user cancels
	}));

	// 注册命令
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.extensions', async (uri) => {
		console.log(path.join(__dirname, 'extensions.dart'));
    vscode.workspace.openTextDocument(path.join(__dirname, 'extensions.dart')).then(doc => {
        vscode.window.showTextDocument(doc);
    });
	}));

}
export function deactivate() { } 
