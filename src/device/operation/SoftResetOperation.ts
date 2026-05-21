import { DeviceManager } from "../DeviceManager";
import { CTRL_D, ENTER_REPL } from "../../types/constants";

export class SoftResetOperation {
  /**
   * Executes a SoftReset on the board.
   */
  static async execute(device: DeviceManager) {
    const { mountManager, repl, stateManager } = device;

    stateManager.set({ running: true });

    // Mount mode: send Ctrl+D directly into the Mount REPL
    if (mountManager.isActive) {
      mountManager.sendSoftReset();
      stateManager.set({ running: false });
      return;
    }

    if (repl.isOpen) {
      // Send reset through the open REPL's serial connection
      repl.softReset();
      stateManager.set({ running: false });
    } else {
      try {
        device.withBoard(async (board) => {
          // Ensure the board is in friendly REPL mode before sending Ctrl-D.
          // After runFile/stop the board may still be in raw REPL mode, where
          // Ctrl-D only exits raw REPL instead of triggering a soft reset.
          await new Promise<void>((resolve, reject) =>
            board.serial.write(Buffer.from(ENTER_REPL), (err: Error | null) =>
              err ? reject(err) : resolve(),
            ),
          );
          await new Promise<void>((resolve, reject) =>
            board.serial.drain((err: Error | null) =>
              err ? reject(err) : resolve(),
            ),
          );
          await new Promise((resolve) => setTimeout(resolve, 300));
          await new Promise<void>((resolve, reject) =>
            board.serial.write(Buffer.from(CTRL_D), (err: Error | null) =>
              err ? reject(err) : resolve(),
            ),
          );
          await new Promise<void>((resolve, reject) =>
            board.serial.drain((err: Error | null) =>
              err ? reject(err) : resolve(),
            ),
          );
          await board.close();
        });
      } finally {
        stateManager.set({ running: false });
      }
    }
  }
}
