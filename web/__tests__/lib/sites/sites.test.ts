import { describe, expect, it } from "vitest";
import { createSite, getSite, listSites } from "@/lib/sites/sites";
import { createMockSupabase } from "../../helpers/mock-supabase";
import { sampleSites } from "../../helpers/test-fixtures";

describe("listSites", () => {
  it("returns sites ordered by created_at ascending", async () => {
    const { client, from, builders } = createMockSupabase({
      fromResults: {
        sites: { data: sampleSites, error: null },
      },
    });

    const sites = await listSites(client);

    expect(from).toHaveBeenCalledWith("sites");
    expect(builders.get("sites")?.select).toHaveBeenCalledWith(
      "id, domain, created_at",
    );
    expect(builders.get("sites")?.order).toHaveBeenCalledWith("created_at", {
      ascending: true,
    });
    expect(sites).toEqual(sampleSites);
  });

  it("throws when Supabase returns an error", async () => {
    const { client } = createMockSupabase({
      fromResults: {
        sites: { data: null, error: { message: "permission denied" } },
      },
    });

    await expect(listSites(client)).rejects.toThrow(
      "Failed to list sites: permission denied",
    );
  });
});

describe("getSite", () => {
  it("returns a site when found", async () => {
    const { client, builders } = createMockSupabase({
      fromResults: {
        sites: { data: sampleSites[0], error: null },
      },
    });

    const site = await getSite(client, "site-1");

    expect(builders.get("sites")?.eq).toHaveBeenCalledWith("id", "site-1");
    expect(builders.get("sites")?.maybeSingle).toHaveBeenCalled();
    expect(site).toEqual(sampleSites[0]);
  });
});

describe("createSite", () => {
  it("normalizes domain and returns the created site", async () => {
    const created = {
      id: "site-3",
      domain: "new.example",
      created_at: "2026-03-01T00:00:00.000Z",
    };
    const { client, builders } = createMockSupabase({
      fromResults: {
        sites: { data: created, error: null },
      },
    });

    const result = await createSite(client, "user-1", "  New.Example  ");

    expect(builders.get("sites")?.insert).toHaveBeenCalledWith({
      domain: "new.example",
      user_id: "user-1",
    });
    expect(builders.get("sites")?.select).toHaveBeenCalledWith(
      "id, domain, created_at",
    );
    expect(builders.get("sites")?.single).toHaveBeenCalled();
    expect(result).toEqual({ site: created });
  });

  it("returns a structured error on failure", async () => {
    const { client } = createMockSupabase({
      fromResults: {
        sites: {
          data: null,
          error: { code: "23505", message: "duplicate key" },
        },
      },
    });

    const result = await createSite(client, "user-1", "example.com");

    expect(result).toEqual({
      error: { code: "23505", message: "duplicate key" },
    });
  });
});
