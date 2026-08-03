import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SitesList } from "@/app/dashboard/components/sites-list";
import { renderWithIntl } from "../helpers/render-with-intl";
import { sampleSites } from "../helpers/test-fixtures";

const push = vi.fn();
const refresh = vi.fn();
const createSiteMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({}),
}));

vi.mock("@/lib/sites/sites", () => ({
  createSite: (...args: unknown[]) => createSiteMock(...args),
}));

describe("SitesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial sites", () => {
    renderWithIntl(
      <SitesList initialSites={sampleSites} userId="user-1" />,
    );

    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("acme.io")).toBeInTheDocument();
  });

  it("shows empty state when there are no sites", () => {
    renderWithIntl(<SitesList initialSites={[]} userId="user-1" />);

    expect(
      screen.getByText("No sites yet. Add your first site below."),
    ).toBeInTheDocument();
  });

  it("toggles the add site form", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SitesList initialSites={[]} userId="user-1" />);

    await user.click(screen.getByRole("button", { name: /Add a new site/i }));
    expect(screen.getByLabelText("Domain")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByLabelText("Domain")).not.toBeInTheDocument();
  });

  it("validates empty domain before calling createSite", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SitesList initialSites={[]} userId="user-1" />);

    await user.click(screen.getByRole("button", { name: /Add a new site/i }));
    const input = screen.getByLabelText("Domain");
    await user.clear(input);
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "Create site" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a domain.",
    );
    expect(createSiteMock).not.toHaveBeenCalled();
  });

  it("adds a site on successful create", async () => {
    createSiteMock.mockResolvedValue({
      site: {
        id: "site-3",
        domain: "new.com",
        created_at: "2026-03-01T00:00:00.000Z",
      },
    });

    const user = userEvent.setup();
    renderWithIntl(<SitesList initialSites={[]} userId="user-1" />);

    await user.click(screen.getByRole("button", { name: /Add a new site/i }));
    await user.type(screen.getByLabelText("Domain"), "New.Com");
    await user.click(screen.getByRole("button", { name: "Create site" }));

    await waitFor(() => {
      expect(createSiteMock).toHaveBeenCalledWith({}, "user-1", "new.com");
      expect(screen.getByText("new.com")).toBeInTheDocument();
      expect(refresh).toHaveBeenCalledOnce();
    });
  });

  it("maps duplicate key errors to a friendly message", async () => {
    createSiteMock.mockResolvedValue({
      error: { code: "23505", message: "duplicate key" },
    });

    const user = userEvent.setup();
    renderWithIntl(
      <SitesList initialSites={sampleSites} userId="user-1" />,
    );

    await user.click(screen.getByRole("button", { name: /Add a new site/i }));
    await user.type(screen.getByLabelText("Domain"), "example.com");
    await user.click(screen.getByRole("button", { name: "Create site" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You already have a site with that domain.",
    );
  });

  it("shows raw error messages for non-duplicate failures", async () => {
    createSiteMock.mockResolvedValue({
      error: { message: "Something went wrong" },
    });

    const user = userEvent.setup();
    renderWithIntl(<SitesList initialSites={[]} userId="user-1" />);

    await user.click(screen.getByRole("button", { name: /Add a new site/i }));
    await user.type(screen.getByLabelText("Domain"), "fail.com");
    await user.click(screen.getByRole("button", { name: "Create site" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong",
    );
  });
});
