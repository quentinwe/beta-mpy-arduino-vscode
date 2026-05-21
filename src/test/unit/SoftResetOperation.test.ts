import { SoftResetOperation } from "../../device/operation/SoftResetOperation";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeDevice() {
  return {
    stateManager: { set: jest.fn() },
    mountManager: { isActive: false as boolean, sendSoftReset: jest.fn() },
    repl: { isOpen: false as boolean, softReset: jest.fn() },
    // fire-and-forget in the serial branch — no await in production code
    withBoard: jest.fn().mockResolvedValue(undefined),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SoftResetOperation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("always sets running:true at the start, regardless of branch", async () => {
    const device = makeDevice();

    await SoftResetOperation.execute(device as any);

    expect((device.stateManager.set as jest.Mock).mock.calls[0]).toEqual([
      { running: true },
    ]);
  });

  // ── mount mode ───────────────────────────────────────────────────────────────

  describe("mount mode", () => {
    it("calls sendSoftReset", async () => {
      const device = makeDevice();
      device.mountManager.isActive = true;

      await SoftResetOperation.execute(device as any);

      expect(device.mountManager.sendSoftReset).toHaveBeenCalled();
    });

    it("sets running:false and does not call withBoard", async () => {
      const device = makeDevice();
      device.mountManager.isActive = true;

      await SoftResetOperation.execute(device as any);

      expect(device.withBoard).not.toHaveBeenCalled();
      const calls = (device.stateManager.set as jest.Mock).mock.calls;
      expect(calls.at(-1)).toEqual([{ running: false }]);
    });
  });

  // ── REPL mode ─────────────────────────────────────────────────────────────────

  describe("REPL mode", () => {
    it("calls repl.softReset", async () => {
      const device = makeDevice();
      device.repl.isOpen = true;

      await SoftResetOperation.execute(device as any);

      expect(device.repl.softReset).toHaveBeenCalled();
    });

    it("sets running:false and does not call withBoard", async () => {
      const device = makeDevice();
      device.repl.isOpen = true;

      await SoftResetOperation.execute(device as any);

      expect(device.withBoard).not.toHaveBeenCalled();
      const calls = (device.stateManager.set as jest.Mock).mock.calls;
      expect(calls.at(-1)).toEqual([{ running: false }]);
    });
  });

  // ── serial mode (fire-and-forget via withBoard) ───────────────────────────────

  describe("serial mode", () => {
    it("calls withBoard", async () => {
      const device = makeDevice();

      await SoftResetOperation.execute(device as any);

      expect(device.withBoard).toHaveBeenCalled();
    });

    it("sets running:false in the finally block", async () => {
      const device = makeDevice();

      await SoftResetOperation.execute(device as any);

      const calls = (device.stateManager.set as jest.Mock).mock.calls;
      expect(calls.at(-1)).toEqual([{ running: false }]);
    });
  });
});
