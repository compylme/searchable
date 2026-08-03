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

  it("opens a detail modal when a bar is clicked", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PlatformBreakdown platforms={samplePlatforms} />);

    await user.click(screen.getByTestId("bar-click"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Bot activity")).toBeInTheDocument();
    expect(screen.getAllByText("GPTBot").length).toBeGreaterThan(0);
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
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
