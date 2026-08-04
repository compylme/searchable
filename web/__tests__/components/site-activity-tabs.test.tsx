import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteActivityTabs } from "@/app/dashboard/components/site-activity-tabs";
import { renderWithIntl } from "../helpers/render-with-intl";
import { sampleSiteAnalytics } from "../helpers/test-fixtures";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  LineChart: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Bar: () => null,
  Line: () => null,
}));

describe("SiteActivityTabs", () => {
  it("switches panels when tabs are clicked", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <SiteActivityTabs
        domain="example.com"
        siteId="site-1"
        analytics={sampleSiteAnalytics}
      />,
    );

    await user.click(screen.getByRole("tab", { name: /Top pages/i }));

    expect(screen.getByRole("tab", { name: /Top pages/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("/blog")).toBeInTheDocument();
    expect(screen.queryByText("Total crawls")).not.toBeInTheDocument();
  });
});
