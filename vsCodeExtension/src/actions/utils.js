"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMethodsFromFile = exports.sectionizeCode = void 0;
const vscode = require("vscode");
const java_ast_1 = require("java-ast");
function sectionizeCode(editor, lineStart, lineEnd) {
    const document = editor.document;
    if (lineEnd - lineStart <= 15) {
        let initPos = new vscode.Position(lineStart, 0);
        let endPos = new vscode.Position(lineEnd, 0);
        let selection = new vscode.Selection(initPos, endPos);
        const code = document.getText(selection);
        let requestBody = [
            {
                lines: [lineStart, lineEnd],
                code: code
            }
        ];
        return requestBody;
    }
    const totalSections = Math.ceil((lineEnd - lineStart) / 15);
    let data = [];
    for (let i = 0; i < totalSections; i++) {
        let initPos = new vscode.Position(lineStart + 15 * i, 0);
        let endPos = new vscode.Position(lineStart + 15 * (i + 1), 0);
        let newSelection = new vscode.Selection(initPos, endPos);
        let code = document.getText(newSelection);
        let item = {
            lines: [lineStart + 15 * i, lineStart + 15 * (i + 1)],
            code: code
        };
        data.push(item);
    }
    return data;
}
exports.sectionizeCode = sectionizeCode;
function extractMethodsFromFile(editor) {
    const document = editor.document;
    const code = document.getText();
    let methodsAndNames = extractJavaMethods(code);
    let data = [];
    if (methodsAndNames) {
        methodsAndNames.forEach((elem) => {
            let methodData = elem.split(NAME_METHOD_SEPARATOR);
            let item = {
                name: methodData[0],
                code: methodData[1]
            };
            data.push(item);
        });
    }
    return data;
}
exports.extractMethodsFromFile = extractMethodsFromFile;
const METHOD_SEPARATOR = "#$%&#";
const NAME_METHOD_SEPARATOR = ":::";
const extractJavaMethods = (source) => {
    let ast = (0, java_ast_1.parse)(source);
    /*
    * Visitor iterates through all method declarations and builds the object
    * <METHOD_NAME><NAME_METHOD_SEPARATOR><METHOD_BODY> for each method in
    * visitMethodDeclaration(). Then, in aggregateResult() it appends all
    * objects, with the separator <METHOD_SEPARATOR>. Everything can be splitted later.
    */
    let visitor = (0, java_ast_1.createVisitor)({
        visitMethodDeclaration: (ctx) => ctx.IDENTIFIER().text + NAME_METHOD_SEPARATOR + ctx.methodBody().text,
        defaultResult: () => null,
        aggregateResult: (a, b) => a + METHOD_SEPARATOR + b
    }).visit(ast);
    return visitor?.split(METHOD_SEPARATOR).filter(function (el) { return el !== 'null'; });
};
//# sourceMappingURL=utils.js.map