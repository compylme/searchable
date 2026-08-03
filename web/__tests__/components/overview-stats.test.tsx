import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { OverviewStats } from "@/app/dashboard/components/overview-stats";
import { renderWithIntl } from "../helpers/render-with-intl";
import { sampleOverviewStats } from "../helpers/test-fixtures";

describe("OverviewStats", () => {
  it("renders empty state when totalCrawls is 0", () => {
    renderWithIntl(
      <OverviewStats
        stats={{
          totalCrawls: 0,
          uniquePlatforms: 0,
          uniquePages: 0,
          uniqueBots: 0,
          lastSeenAt: null,
        }}
      />,
    );

    expect(
      screen.getByText("No crawler activity yet for this site."),
    ).toBeInTheDocument();
  });

  it("renders all stat card values", () => {
    renderWithIntl(<OverviewStats stats={sampleOverviewStats} />);

    expect(screen.getByText("Total crawls")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Platforms")).toBeInTheDocument();
    expect(screen.getByText("Pages")).toBeInTheDocument();
    expect(screen.getByText("Bots")).toBeInTheDocument();
    expect(screen.getByText("Last seen")).toBeInTheDocument();
    expect(screen.getAllByText("3")).toHaveLength(3);
  });

  it("shows a dash when lastSeenAt is null but crawls exist", () => {
    renderWithIntl(
      <OverviewStats
        stats={{
          ...sampleOverviewStats,
          lastSeenAt: null,
        }}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
