"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const { SidebarProvider } = require('./SidebarProvider'); // Assuming SidebarProvider.ts is in the same directory
// const sidebarProvider = new SidebarProvider(context.extensionUri);
function activate(context) {
    // import { SidebarProvider } from 'C:/javaanalyser/VDET-for-Java/plugin/vdet-java/src/SidebarProvider.ts';
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("vdet-sidebar", // match package.json
    sidebarProvider));
    context.subscriptions.push(vscode.commands.registerCommand('vdet-java.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from vdet-java!');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('vdet-java.active-file-prediction', async () => {
        // TODO: open sidebar with specific keyboard keys
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map