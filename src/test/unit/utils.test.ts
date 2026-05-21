import { validateName, toGithubShorthand } from "../../webview/utils";

describe("validateName", () => {
  it("returns undefined for a valid name", () => {
    expect(validateName("main.py")).toBeUndefined();
    expect(validateName("my_folder")).toBeUndefined();
    expect(validateName("file-1")).toBeUndefined();
  });

  it("rejects empty string", () => {
    expect(validateName("")).toBe("Name cannot be empty or whitespace.");
  });

  it("rejects whitespace-only string", () => {
    expect(validateName("   ")).toBe("Name cannot be empty or whitespace.");
    expect(validateName("\t")).toBe("Name cannot be empty or whitespace.");
  });

  it.each(["/", "\\", ":", "*", "?", '"', "<", ">", "|"])(
    "rejects illegal character '%s'",
    (char) => {
      expect(validateName(`file${char}name`)).toBe(
        'Name contains illegal characters: \\ / : * ? " < > |',
      );
    },
  );

  it("rejects name with illegal char embedded", () => {
    expect(validateName("my/file")).toBeTruthy();
    expect(validateName("foo:bar")).toBeTruthy();
  });
});

// ── toGithubShorthand ─────────────────────────────────────────────────────────

describe("toGithubShorthand", () => {
  it("converts an https GitHub URL to github:owner/repo", () => {
    expect(toGithubShorthand("https://github.com/owner/repo")).toBe(
      "github:owner/repo",
    );
  });

  it("strips a trailing .git suffix", () => {
    expect(toGithubShorthand("https://github.com/owner/repo.git")).toBe(
      "github:owner/repo",
    );
  });

  it("also converts http (non-https) GitHub URLs", () => {
    expect(toGithubShorthand("http://github.com/owner/repo")).toBe(
      "github:owner/repo",
    );
  });

  it("returns the original URL unchanged for non-GitHub hosts", () => {
    expect(toGithubShorthand("https://gitlab.com/owner/repo")).toBe(
      "https://gitlab.com/owner/repo",
    );
  });

  it("returns a github: shorthand unchanged (already in correct form)", () => {
    expect(toGithubShorthand("github:owner/repo")).toBe("github:owner/repo");
  });

  it("returns a plain package name unchanged", () => {
    expect(toGithubShorthand("umqtt.simple")).toBe("umqtt.simple");
  });
});
