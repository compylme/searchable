export type Site = {
  id: string;
  domain: string;
  created_at: string;
};

export type CreateSiteError = {
  code?: string;
  message: string;
};

export type CreateSiteResult =
  | { site: Site; error?: never }
  | { site?: never; error: CreateSiteError };
