import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { getUserMock, createServerClientMock } = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const createServerClientMock = vi.fn(() => ({
    auth: { getUser: getUserMock },
  }));
  return { getUserMock, createServerClientMock };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

import { updateSession } from "@/lib/supabase/middleware";

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("redirects unauthenticated users away from /dashboard", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(makeRequest("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects authenticated users away from /login", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const response = await updateSession(makeRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
  });

  it("allows authenticated users on /dashboard", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const response = await updateSession(makeRequest("/dashboard"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated users on public routes", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(makeRequest("/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
