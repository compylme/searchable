import type { ActivityLogEvent } from "./types";

const CSV_HEADER =
  "timestamp,page_url,bot_name,platform,bot_type,user_agent";

export function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function toIsoZ(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toISOString();
}

export function toActivityLogCsv(events: ActivityLogEvent[]): string {
  const rows = events.map((event) =>
    [
      toIsoZ(event.receivedAt),
      event.pageUrl,
      event.botName,
      event.platform,
      event.botType,
      event.userAgent,
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  return [CSV_HEADER, ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function activityLogCsvFilename(domain: string, date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${domain}-bot-activity-${year}-${month}-${day}.csv`;
}
