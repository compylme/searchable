import { describe, expect, it } from "vitest";
import { computeWeeklyActivity } from "@/lib/analytics/site-analytics";
import { makeCrawlerEvent } from "../../helpers/test-fixtures";

describe("computeWeeklyActivity", () => {
  it("returns an empty array when there are no events", () => {
    expect(computeWeeklyActivity([])).toEqual([]);
  });

  it("returns a fixed week window including the current week", () => {
    const now = new Date(2026, 5, 17);
    const result = computeWeeklyActivity(
      [makeCrawlerEvent({ received_at: "2026-06-17T12:00:00.000Z" })],
      { weeks: 4, now },
    );

    expect(result).toHaveLength(4);
    expect(result.map((point) => point.weekStart)).toEqual([
      "2026-05-25",
      "2026-06-01",
      "2026-06-08",
      "2026-06-15",
    ]);
    expect(result[3]).toMatchObject({
      weekStart: "2026-06-15",
      crawlCount: 1,
    });
  });

  it("buckets multiple events into the same week", () => {
    const now = new Date(2026, 5, 17);
    const result = computeWeeklyActivity(
      [
        makeCrawlerEvent({ received_at: "2026-06-15T10:00:00.000Z" }),
        makeCrawlerEvent({ received_at: "2026-06-16T10:00:00.000Z" }),
        makeCrawlerEvent({ received_at: "2026-06-17T10:00:00.000Z" }),
      ],
      { weeks: 2, now },
    );

    expect(result).toEqual([
      expect.objectContaining({ weekStart: "2026-06-08", crawlCount: 0 }),
      expect.objectContaining({ weekStart: "2026-06-15", crawlCount: 3 }),
    ]);
  });

  it("zero-fills weeks with no activity inside the window", () => {
    const now = new Date(2026, 5, 17);
    const result = computeWeeklyActivity(
      [makeCrawlerEvent({ received_at: "2026-06-01T10:00:00.000Z" })],
      { weeks: 3, now },
    );

    expect(result.map((point) => point.crawlCount)).toEqual([1, 0, 0]);
  });

  it("ignores events outside the window", () => {
    const now = new Date(2026, 5, 17);
    const result = computeWeeklyActivity(
      [
        makeCrawlerEvent({ received_at: "2026-01-01T10:00:00.000Z" }),
        makeCrawlerEvent({ received_at: "2026-06-16T10:00:00.000Z" }),
      ],
      { weeks: 2, now },
    );

    expect(result.map((point) => point.crawlCount)).toEqual([0, 1]);
  });

  it("skips invalid timestamps", () => {
    const now = new Date(2026, 5, 17);
    const result = computeWeeklyActivity(
      [
        makeCrawlerEvent({ received_at: "not-a-date" }),
        makeCrawlerEvent({ received_at: "2026-06-16T10:00:00.000Z" }),
      ],
      { weeks: 1, now },
    );

    expect(result).toEqual([
      expect.objectContaining({ weekStart: "2026-06-15", crawlCount: 1 }),
    ]);
  });

  it("defaults to a 12-week window", () => {
    const now = new Date(2026, 5, 17);
    const result = computeWeeklyActivity(
      [makeCrawlerEvent({ received_at: "2026-06-16T10:00:00.000Z" })],
      { now },
    );

    expect(result).toHaveLength(12);
    expect(result[0]?.weekStart).toBe("2026-03-30");
    expect(result[11]?.weekStart).toBe("2026-06-15");
  });
});
