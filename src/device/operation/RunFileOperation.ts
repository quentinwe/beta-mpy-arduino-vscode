import * as vscode from "vscode";
import * as path from "path";
import { DeviceManager } from "../DeviceManager";
import { runBoardFile } from "./ScriptRunner";

export class RunFileOperation {
  /**
   * Runs local file on the board while mount is active
   */
  static async executeMountedFile(device: DeviceManager, filePath: string) {
    const { mountManager } = device;

    if (mountManager.isActive) {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const relativePath = path
        .relative(workspaceRoot, filePath)
        .replace(/\\/g, "/");

      mountManager.sendFile(relativePath);
    }
  }

  /**
   * Runs boardfile on the board and handles boardstate
   */
  static async executeBoardfile(device: DeviceManager, filePath: string) {
    const { stateManager } = device;
    try {
      await device.withBoard(async (board) => {
        stateManager.set({ running: true });

        await runBoardFile(board, filePath, device.connectedPort);
      });
    } finally {
      stateManager.set({ running: false });
    }
  }
}
