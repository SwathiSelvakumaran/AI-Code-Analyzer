"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = require("vscode");
const predictionOnSingleFile_1 = require("./actions/predictionOnSingleFile");
const utils_1 = require("./actions/utils");
// From: https://github.com/benawad/vsinder/blob/master/packages/extension/src/SidebarProvider.ts
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                webviewView.webview.postMessage({ command: 'onError', error: "Invalid text editor. Please open your file for scanning." });
                return;
            }
            if ((editor.document.languageId.toUpperCase()) !== ("java".toUpperCase())) {
                webviewView.webview.postMessage({ command: 'onError', error: "Invalid language. Please ensure the file has the java extension." });
                return;
            }
            const filename = (editor.document.fileName).split('\\').pop();
            switch (data.type) {
                case "onCodeSelection": {
                    let start = new Date().getTime();
                    const selection = editor.selection;
                    const lineStart = selection.start.line;
                    const lineEnd = selection.end.line;
                    if (lineEnd - lineStart < 1) {
                        webviewView.webview.postMessage({ command: 'onError', error: "Please, select a bigger code section." });
                        return;
                    }
                    const code = editor.document.getText(selection);
                    let requestBody = {
                        lines: [lineStart, lineEnd],
                        code: code
                    };
                    const predictions = await (0, predictionOnSingleFile_1.predictionOnSection)(requestBody);
                    let end = new Date().getTime();
                    let time = end - start;
                    webviewView.webview.postMessage({ command: 'codeSelectionPrediction', filename: filename, predictions: predictions, time: time });
                    return;
                }
                case "onCompleteFile": {
                    let start = new Date().getTime();
                    let requestBody = (0, utils_1.extractMethodsFromFile)(editor);
                    const predictions = await (0, predictionOnSingleFile_1.predictionOnSingleFile)(requestBody);
                    let end = new Date().getTime();
                    let time = end - start;
                    webviewView.webview.postMessage({ command: 'completeFilePrediction', filename: filename, predictions: predictions, time: time });
                    return;
                }
                case "onAllFiles": {
                    // TODO: prediction on all files
                    return;
                }
            }
        });
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        // Custom css for the specific sidebar
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/bundle.css"));
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                </script>
			</head>
            <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
// From: https://github.com/benawad/vsinder/blob/master/packages/extension/src/getNonce.ts
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=SidebarProvider.js.map