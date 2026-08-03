import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlatformBreakdown } from "@/app/dashboard/components/platform-breakdown";
import { renderWithIntl } from "../helpers/render-with-intl";
import { samplePlatforms } from "../helpers/test-fixtures";

vi.mock("recharts", () => {
  const Passthrough = ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: (data: { payload: unknown }) => void;
  }) => (
    <div data-testid="recharts-bar">
      {children}
      {onClick && (
        <button
          type="button"
          data-testid="bar-click"
          onClick={() =>
            onClick({
              payload: samplePlatforms[0],
            })
          }
        >
          open modal
        </button>
      )}
    </div>
  );

  return {
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    BarChart: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Bar: Passthrough,
  };
});

describe("PlatformBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when there are no platforms", () => {
    renderWithIntl(<PlatformBreakdown platforms={[]} />);

    expect(
      screen.getByText("No platform activity to chart yet."),
    ).toBeInTheDocument();
  });

  it("renders the chart title for non-empty data", () => {
    renderWithIntl(<PlatformBreakdown platforms={samplePlatforms} />);

    expect(screen.getByText("Crawls by bot")).toBeInTheDocument();
    expect(
      screen.getByText("Click a bar to view bot details"),
    ).toBeInTheDocument();
  });

  it("opens a detail modal when a bar is clicked", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PlatformBreakdown platforms={samplePlatforms} />);

    await user.click(screen.getByTestId("bar-click"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Bot activity")).toBeInTheDocument();
    expect(screen.getAllByText("GPTBot").length).toBeGreaterThan(0);
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
  });

  it("closes the modal via the close button", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PlatformBreakdown platforms={samplePlatforms} />);

    await user.click(screen.getByTestId("bar-click"));
    await user.click(screen.getByRole("button", { name: /Close/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the modal when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PlatformBreakdown platforms={samplePlatforms} />);

    await user.click(screen.getByTestId("bar-click"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
