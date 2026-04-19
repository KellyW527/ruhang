import { describe, expect, it } from "vitest";

import { resolveSupabasePublicConfig } from "@/integrations/supabase/client";

describe("resolveSupabasePublicConfig", () => {
  it("prefers publishable key when present", () => {
    const result = resolveSupabasePublicConfig({
      VITE_SUPABASE_URL: "https://demo-project.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      VITE_SUPABASE_ANON_KEY: "anon-key",
    });

    expect(result.ok).toBe(true);
    expect(result.key).toBe("publishable-key");
    expect(result.keySource).toBe("publishable");
  });

  it("falls back to anon key when publishable key is missing", () => {
    const result = resolveSupabasePublicConfig({
      VITE_SUPABASE_URL: "https://demo-project.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon-key",
    });

    expect(result.ok).toBe(true);
    expect(result.key).toBe("anon-key");
    expect(result.keySource).toBe("anon");
  });

  it("normalizes duplicated https prefixes and still validates", () => {
    const result = resolveSupabasePublicConfig({
      VITE_SUPABASE_URL: "https://https://demo-project.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    });

    expect(result.ok).toBe(true);
    expect(result.url).toBe("https://demo-project.supabase.co");
  });

  it("reports missing config clearly", () => {
    const result = resolveSupabasePublicConfig({});

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("缺少 VITE_SUPABASE_URL");
    expect(result.issues).toContain("缺少 VITE_SUPABASE_PUBLISHABLE_KEY（或过渡兼容的 VITE_SUPABASE_ANON_KEY）");
  });
});
