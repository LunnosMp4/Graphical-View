// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const core = require('./src/core.js');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	
	let showWebView = vscode.commands.registerCommand('graphical-view.showWebView', function () {
		core.InitWebview();
	});

	let manageGroups = vscode.commands.registerCommand('graphical-view.manageWebView', function () {
		core.ManageWebview();
	});

	context.subscriptions.push(showWebView, manageGroups);
}

// This method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
