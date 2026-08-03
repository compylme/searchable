import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopPagesTable } from "@/app/dashboard/components/top-pages-table";
import { renderWithIntl } from "../helpers/render-with-intl";
import { sampleTopPages } from "../helpers/test-fixtures";

describe("TopPagesTable", () => {
  it("renders empty state when there are no pages", () => {
    renderWithIntl(<TopPagesTable pages={[]} />);

    expect(
      screen.getByText("No pages have been crawled yet."),
    ).toBeInTheDocument();
  });

  it("renders pages sorted by crawl count descending by default", () => {
    renderWithIntl(<TopPagesTable pages={sampleTopPages} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("/blog")).toBeInTheDocument();
    expect(within(rows[1]).getByText("/pricing")).toBeInTheDocument();
    expect(within(rows[2]).getByText("/about")).toBeInTheDocument();
  });

  it("toggles crawl count sort direction", async () => {
    const user = userEvent.setup();
    renderWithIntl(<TopPagesTable pages={sampleTopPages} />);

    await user.click(
      screen.getByRole("button", { name: /Sort by crawl count/i }),
    );

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("/about")).toBeInTheDocument();
    expect(within(rows[2]).getByText("/blog")).toBeInTheDocument();
  });

  it("sorts by page path ascending when path header is clicked", async () => {
    const user = userEvent.setup();
    renderWithIntl(<TopPagesTable pages={sampleTopPages} />);

    await user.click(
      screen.getByRole("button", { name: /Sort by page path/i }),
    );

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("/about")).toBeInTheDocument();
    expect(within(rows[1]).getByText("/blog")).toBeInTheDocument();
    expect(within(rows[2]).getByText("/pricing")).toBeInTheDocument();
  });

  it("renders crawler badges", () => {
    renderWithIntl(<TopPagesTable pages={sampleTopPages} />);

    expect(screen.getByText("ClaudeBot")).toBeInTheDocument();
    expect(screen.getAllByText("GPTBot").length).toBeGreaterThan(0);
  });
});
