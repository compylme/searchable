import { afterEach, describe, expect, it, vi } from "vitest";
import {
  activityLogCsvFilename,
  downloadCsv,
  escapeCsvValue,
  toActivityLogCsv,
} from "@/lib/analytics/export-csv";
import { sampleActivityLogEvents } from "../../helpers/test-fixtures";

describe("escapeCsvValue", () => {
  it("returns plain values unchanged", () => {
    expect(escapeCsvValue("hello")).toBe("hello");
    expect(escapeCsvValue("path/to/page")).toBe("path/to/page");
  });

  it("quotes values containing commas, quotes, or newlines", () => {
    expect(escapeCsvValue("a,b")).toBe('"a,b"');
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvValue("line1\rline2")).toBe('"line1\rline2"');
  });
});

describe("toActivityLogCsv", () => {
  it("includes a header row and one row per event", () => {
    const csv = toActivityLogCsv(sampleActivityLogEvents);
    const lines = csv.split("\n");

    expect(lines[0]).toBe(
      "timestamp,page_url,bot_name,platform,bot_type,user_agent",
    );
    expect(lines).toHaveLength(4);
    expect(lines[1]).toContain("https://example.com/blog");
    expect(lines[1]).toContain("GPTBot");
  });

  it("returns only the header for an empty list", () => {
    expect(toActivityLogCsv([])).toBe(
      "timestamp,page_url,bot_name,platform,bot_type,user_agent",
    );
  });

  it("escapes special characters in fields", () => {
    const csv = toActivityLogCsv([
      {
        receivedAt: "2026-06-15T14:00:00.000Z",
        botName: 'Bot "X"',
        platform: "Open,AI",
        botType: "ai",
        pagePath: "/blog",
        pageUrl: "https://example.com/blog",
        userAgent: "ua\nline",
      },
    ]);

    expect(csv).toContain('"Bot ""X"""');
    expect(csv).toContain('"Open,AI"');
    expect(csv).toContain('"ua\nline"');
  });

  it("keeps invalid timestamps as-is", () => {
    const csv = toActivityLogCsv([
      {
        ...sampleActivityLogEvents[0],
        receivedAt: "not-a-date",
      },
    ]);

    expect(csv.split("\n")[1]?.startsWith("not-a-date")).toBe(true);
  });
});

describe("activityLogCsvFilename", () => {
  it("formats domain and date into a filename", () => {
    const filename = activityLogCsvFilename(
      "example.com",
      new Date("2026-03-05T12:00:00.000Z"),
    );
    expect(filename).toBe("example.com-bot-activity-2026-03-05.csv");
  });

  it("pads month and day", () => {
    const filename = activityLogCsvFilename(
      "acme.io",
      new Date(2026, 0, 9),
    );
    expect(filename).toBe("acme.io-bot-activity-2026-01-09.csv");
  });
});

describe("downloadCsv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a blob URL and triggers an anchor download", () => {
    const click = vi.fn();
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const createElement = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        if (tag === "a") {
          return { href: "", download: "", click } as unknown as HTMLAnchorElement;
        }
        return document.createElementNS("http://www.w3.org/1999/xhtml", tag);
      });

    downloadCsv("report.csv", "a,b\n1,2");

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    createElement.mockRestore();
  });
});
