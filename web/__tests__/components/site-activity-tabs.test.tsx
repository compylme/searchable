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
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Bar: () => null,
}));

describe("SiteActivityTabs", () => {
  it("renders overview tab selected by default", () => {
    renderWithIntl(
      <SiteActivityTabs domain="example.com" analytics={sampleSiteAnalytics} />,
    );

    const overviewTab = screen.getByRole("tab", { name: /Overview/i });
    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Total crawls")).toBeInTheDocument();
  });

  it("switches panels when tabs are clicked", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <SiteActivityTabs domain="example.com" analytics={sampleSiteAnalytics} />,
    );

    await user.click(screen.getByRole("tab", { name: /Top pages/i }));

    expect(screen.getByRole("tab", { name: /Top pages/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("/blog")).toBeInTheDocument();
    expect(screen.queryByText("Total crawls")).not.toBeInTheDocument();
  });

  it("exposes ARIA tablist relationships", () => {
    renderWithIntl(
      <SiteActivityTabs domain="example.com" analytics={sampleSiteAnalytics} />,
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "Site activity",
    );

    const platformsTab = screen.getByRole("tab", { name: /Platforms/i });
    expect(platformsTab).toHaveAttribute("aria-controls", "site-panel-platforms");
    expect(platformsTab).toHaveAttribute("id", "site-tab-platforms");
  });

  it("shows activity log panel content", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <SiteActivityTabs domain="example.com" analytics={sampleSiteAnalytics} />,
    );

    await user.click(screen.getByRole("tab", { name: /Activity log/i }));

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText(/Showing 3 events/)).toBeInTheDocument();
  });
});
