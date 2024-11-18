import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "flutter-project-forge" is now !');
	const disposable = vscode.commands.registerCommand('flutter-project-forge.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World ');
	});
	context.subscriptions.push(disposable);
}
export function deactivate() {}
