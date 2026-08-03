import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { WeeklyActivityChart } from "@/app/dashboard/components/weekly-activity-chart";
import { renderWithIntl } from "../helpers/render-with-intl";
import { sampleWeeklyActivity } from "../helpers/test-fixtures";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children?: React.ReactNode;
    data?: unknown[];
  }) => (
    <div data-testid="weekly-bar-chart" data-points={data?.length ?? 0}>
      {children}
    </div>
  ),
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Bar: () => <div data-testid="weekly-bars" />,
}));

describe("WeeklyActivityChart", () => {
  it("renders empty state when there is no weekly data", () => {
    renderWithIntl(<WeeklyActivityChart data={[]} />);

    expect(
      screen.getByText("No weekly activity to chart yet."),
    ).toBeInTheDocument();
  });

  it("renders the chart title and series for weekly data", () => {
    renderWithIntl(<WeeklyActivityChart data={sampleWeeklyActivity} />);

    expect(screen.getByText("Weekly crawls")).toBeInTheDocument();
    expect(
      screen.getByText("Total crawler visits over the last 12 weeks"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("weekly-bar-chart")).toHaveAttribute(
      "data-points",
      "12",
    );
    expect(screen.getByTestId("weekly-bars")).toBeInTheDocument();
  });
});
