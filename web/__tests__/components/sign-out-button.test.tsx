import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignOutButton } from "@/app/dashboard/components/sign-out-button";
import { renderWithIntl } from "../helpers/render-with-intl";

const push = vi.fn();
const refresh = vi.fn();
const signOut = vi.fn().mockResolvedValue({ error: null });

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut },
  }),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the sign out label", () => {
    renderWithIntl(<SignOutButton />);
    expect(screen.getByRole("button", { name: /Sign out/i })).toBeInTheDocument();
  });

  it("calls supabase signOut and navigates to login", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: /Sign out/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
      expect(push).toHaveBeenCalledWith("/login");
      expect(refresh).toHaveBeenCalledOnce();
    });
  });

  it("shows a loading label while signing out", async () => {
    let resolveSignOut: () => void = () => {};
    signOut.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignOut = () => resolve({ error: null });
        }),
    );

    const user = userEvent.setup();
    renderWithIntl(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: /Sign out/i }));

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Signing out…")).toBeInTheDocument();

    resolveSignOut();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/login");
    });
  });
});
