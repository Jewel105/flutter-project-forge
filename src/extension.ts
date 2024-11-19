import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
	// 注册命令
	context.subscriptions.push(vscode.commands.registerCommand('flutter-project-forge.helloWorld',async () => {
		var awser  = await vscode.window.showInformationMessage('Hello',"good","bad");
		console.log(awser); // good, bad or undefined if user cancels
	}));
	
}
export function deactivate() {} 
