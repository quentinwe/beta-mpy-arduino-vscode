import { vscode } from "./vscode.js";
import { getActivePort } from "./tabs.js";

const connectButton = document.getElementById("connect-btn");
const runButton = document.getElementById("run-btn");
const stopButton = document.getElementById("stop-btn");
const softResetButton = document.getElementById("soft-reset-btn");
const runSelectionButton = document.getElementById("run-selection-btn");

connectButton.addEventListener("click", () => {
  vscode.postMessage({ type: "connect", port: getActivePort() });
});

runButton.addEventListener("click", () => {
  vscode.postMessage({ type: "runFile", port: getActivePort() });
});

stopButton.addEventListener("click", () => {
  vscode.postMessage({ type: "stopFile", port: getActivePort() });
});

softResetButton.addEventListener("click", () => {
  vscode.postMessage({ type: "softReset", port: getActivePort() });
});

runSelectionButton.addEventListener("click", () => {
  vscode.postMessage({ type: "runSelection", port: getActivePort() });
});
