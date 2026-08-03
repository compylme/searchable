import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityLog } from "@/app/dashboard/components/activity-log";
import { renderWithIntl } from "../helpers/render-with-intl";
import { sampleActivityLogEvents } from "../helpers/test-fixtures";


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

});
