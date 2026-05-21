import * as vscode from "vscode";
import { ConnectionManager } from "../../device/ConnectionManager";

export class MountHandler {
  constructor(
    private readonly _connectionManager: ConnectionManager,
    private readonly _ctx: vscode.ExtensionContext,
  ) {}

  /**
   * Toggles the mount state of a board.
   */
  async handleToggle(port: string): Promise<void> {
    try {
      if (this._connectionManager.getDevice(port).mountActive) {
        this.handleDeactivate(port);
      } else {
        this.handleActivate(port);
      }
    } catch (err) {
      vscode.window.showErrorMessage(
        `Failed to mount: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Activates mpremote mount for the board.
   */
  async handleActivate(port: string): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage("MicroPython: No workspace folder open.");
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    try {
      await this._connectionManager
        .getDevice(port)
        .activateMount(workspaceRoot);

      const doNotShow = this._ctx.globalState.get<boolean>(
        "activateMountDialog.doNotShowAgain",
        false,
      );

      if (doNotShow) {
        return;
      }

      const selection = await vscode.window.showInformationMessage(
        `mpremote mount`,
        {
          modal: true,
          detail: `The board is now connected to your local directory.\n\nOther actions will try to route through the mount terminal or are disabled.\n\nCtrl-C: Interrupt\nCtrl-D: Soft-reset (mount reconnects)\nCtrl-A: Raw REPL\nCtrl-B: Normal REPL\nCtrl-E: Paste mode\nCtrl-X: Unmount (Do that before closing VS Code)`,
        },
        "Ok",
        "Don't show again",
      );

      if (selection === "Don't show again") {
        this._ctx.globalState.setKeysForSync([
          "activateMountDialog.doNotShowAgain",
        ]);
        await this._ctx.globalState.update(
          "activateMountDialog.doNotShowAgain",
          true,
        );
      }
    } catch (err) {
      vscode.window.showErrorMessage((err as Error).message);
    }
  }

  /**
   * Deactivates the active board mount.
   */
  async handleDeactivate(port: string): Promise<void> {
    await this._connectionManager.getDevice(port).deactivateMount();
  }
}
