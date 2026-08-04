import { describe, expect, it } from "vitest";
import {
  activityLogCsvFilename,
  escapeCsvValue,
  toActivityLogCsv,
} from "@/lib/analytics/export-csv";
import { sampleActivityLogEvents } from "../../helpers/test-fixtures";

describe("escapeCsvValue", () => {
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
      "timestamp,page_url,bot_name,platform,bot_type,user_agent,ip_hash",
    );
    expect(lines).toHaveLength(4);
    expect(lines[1]).toContain("https://example.com/blog");
    expect(lines[1]).toContain("GPTBot");
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
        ipHash: null,
      },
    ]);

    expect(csv).toContain('"Bot ""X"""');
    expect(csv).toContain('"Open,AI"');
    expect(csv).toContain('"ua\nline"');
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
});
