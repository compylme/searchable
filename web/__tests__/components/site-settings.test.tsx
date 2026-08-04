import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { SiteSettings } from "@/app/dashboard/components/site-settings";
import { renderWithIntl } from "../helpers/render-with-intl";

vi.mock("@/lib/tracking/snippet", () => ({
  buildTrackingSnippet: (siteId: string) =>
    `<script>track('${siteId}')</script>`,
}));

describe("SiteSettings", () => {
  it("shows the tracking snippet for the site", () => {
    renderWithIntl(
      <SiteSettings siteId="site-123" domain="example.com" events={[]} />,
    );

    expect(screen.getByText(/track\('site-123'\)/)).toBeInTheDocument();
  });
});
