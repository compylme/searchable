import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityLog } from "@/app/dashboard/components/activity-log";
import { renderWithIntl } from "../helpers/render-with-intl";
import { sampleActivityLogEvents } from "../helpers/test-fixtures";

const downloadCsv = vi.fn();
const toActivityLogCsv = vi.fn(() => "csv-content");
const activityLogCsvFilename = vi.fn(() => "example.com-bot-activity.csv");

vi.mock("@/lib/analytics/export-csv", () => ({
  downloadCsv: (...args: unknown[]) => downloadCsv(...args),
  toActivityLogCsv: (...args: unknown[]) => toActivityLogCsv(...args),
  activityLogCsvFilename: (...args: unknown[]) =>
    activityLogCsvFilename(...args),
}));

describe("ActivityLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      },
    );
  });

  it("renders empty state when there are no events", () => {
    renderWithIntl(<ActivityLog domain="example.com" events={[]} />);

    expect(
      screen.getByText("No activity matches the selected filter."),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 0 events")).toBeInTheDocument();
  });

  it("groups events by month and expands a month section", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ActivityLog domain="example.com" events={sampleActivityLogEvents} />,
    );

    expect(screen.getByText("Showing 3 events")).toBeInTheDocument();

    const juneButton = screen.getByRole("button", { name: /June 2026/i });
    expect(juneButton).toHaveAttribute("aria-expanded", "false");

    await user.click(juneButton);

    expect(juneButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("/blog")).toBeInTheDocument();
    expect(screen.getByText("GPTBot")).toBeInTheDocument();
  });

  it("filters by bot when a bot chip is selected", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ActivityLog domain="example.com" events={sampleActivityLogEvents} />,
    );

    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(screen.getByRole("button", { name: "GPTBot" }));

    expect(screen.getByText("Showing 1 events")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /June 2026/i }));
    const table = screen.getByRole("table");
    expect(within(table).getByText("GPTBot")).toBeInTheDocument();
    expect(within(table).queryByText("ClaudeBot")).not.toBeInTheDocument();
  });

  it("filters by platform", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ActivityLog domain="example.com" events={sampleActivityLogEvents} />,
    );

    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(screen.getByRole("button", { name: "Google" }));

    expect(screen.getByText("Showing 1 events")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /May 2026/i }));
    const table = screen.getByRole("table");
    expect(within(table).getByText("Googlebot")).toBeInTheDocument();
  });

  it("clears filters", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ActivityLog domain="example.com" events={sampleActivityLogEvents} />,
    );

    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(screen.getByRole("button", { name: "GPTBot" }));
    expect(screen.getByText("Showing 1 events")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Showing 3 events")).toBeInTheDocument();
  });

  it("exports CSV for filtered events", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ActivityLog domain="example.com" events={sampleActivityLogEvents} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Export CSV" }),
    );

    await waitFor(() => {
      expect(toActivityLogCsv).toHaveBeenCalledWith(sampleActivityLogEvents);
      expect(activityLogCsvFilename).toHaveBeenCalledWith("example.com");
      expect(downloadCsv).toHaveBeenCalledWith(
        "example.com-bot-activity.csv",
        "csv-content",
      );
    });
  });

  it("disables export when there are no matching events", () => {
    renderWithIntl(<ActivityLog domain="example.com" events={[]} />);

    expect(
      screen.getByRole("button", { name: "Export CSV" }),
    ).toBeDisabled();
  });

  it("shows active filter count badge", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ActivityLog domain="example.com" events={sampleActivityLogEvents} />,
    );

    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    await user.click(filtersButton);
    await user.click(screen.getByRole("button", { name: "Today" }));
    await user.click(screen.getByRole("button", { name: "GPTBot" }));

    expect(within(filtersButton).getByText("2")).toBeInTheDocument();
  });
});
