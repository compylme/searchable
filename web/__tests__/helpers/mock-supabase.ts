import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

type QueryResult = {
  data?: unknown;
  error?: { message: string; code?: string } | null;
};

type ThenableQuery = {
  then: (
    onfulfilled?: ((value: QueryResult) => unknown) | null,
    onrejected?: ((reason: unknown) => unknown) | null,
  ) => Promise<unknown>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
};

/**
 * Builds a chainable Supabase query mock that resolves to `result`
 * when awaited (or when `.single()` / `.maybeSingle()` is called).
 */
export function createQueryBuilder(result: QueryResult): ThenableQuery {
  const builder: ThenableQuery = {
    then(onfulfilled, onrejected) {
      return Promise.resolve(result).then(onfulfilled, onrejected);
    },
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);

  return builder;
}

export function createMockSupabase(options?: {
  fromResults?: Record<string, QueryResult>;
  defaultResult?: QueryResult;
  auth?: {
    getUser?: () => Promise<{ data: { user: { id: string } | null } }>;
    signInWithPassword?: ReturnType<typeof vi.fn>;
    signUp?: ReturnType<typeof vi.fn>;
    signOut?: ReturnType<typeof vi.fn>;
  };
}): {
  client: SupabaseClient;
  from: ReturnType<typeof vi.fn>;
  builders: Map<string, ThenableQuery>;
} {
  const builders = new Map<string, ThenableQuery>();
  const fromResults = options?.fromResults ?? {};
  const defaultResult = options?.defaultResult ?? { data: [], error: null };

  const from = vi.fn((table: string) => {
    const result = fromResults[table] ?? defaultResult;
    const builder = createQueryBuilder(result);
    builders.set(table, builder);
    return builder;
  });

  const client = {
    from,
    auth: {
      getUser:
        options?.auth?.getUser ??
        vi.fn().mockResolvedValue({ data: { user: null } }),
      signInWithPassword:
        options?.auth?.signInWithPassword ??
        vi.fn().mockResolvedValue({ error: null }),
      signUp:
        options?.auth?.signUp ?? vi.fn().mockResolvedValue({ error: null }),
      signOut:
        options?.auth?.signOut ?? vi.fn().mockResolvedValue({ error: null }),
    },
  } as unknown as SupabaseClient;

  return { client, from, builders };
}
