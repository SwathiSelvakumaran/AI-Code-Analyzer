"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictionOnSingleFile = exports.predictionOnSection = void 0;
const node_fetch_1 = require("node-fetch");
async function predictionOnSection(requestBody) {
    const response = await (0, node_fetch_1.default)('http://127.0.0.1:5000/predict/section', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
    });
    const predictions = await response.json();
    return predictions;
}
exports.predictionOnSection = predictionOnSection;
async function predictionOnSingleFile(requestBody) {
    const response = await (0, node_fetch_1.default)('http://127.0.0.1:5000/predict/file', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
    });
    const predictions = await response.json();
    return predictions;
}
exports.predictionOnSingleFile = predictionOnSingleFile;
//# sourceMappingURL=predictionOnSingleFile.js.map