import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AITool {
  id: string;
  name: string;
  slug: string;
  maker: string;
  logo_url: string | null;
  website_url: string | null;
  category: string;
  subcategory: string | null;
  description: string | null;
  key_capabilities: string[];
  pricing_model: string | null;
  latest_version: string | null;
  latest_release_date: string | null;
  release_history: { version: string; date: string; highlights: string[] }[];
  adoption_score: number;
  maturity: string | null;
  integrations: string[];
  api_available: boolean;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAITools(options?: { category?: string; search?: string }) {
  const { category, search } = options || {};

  const { data: tools = [], isLoading, error, refetch } = useQuery({
    queryKey: ["ai-tools", category, search],
    queryFn: async () => {
      let query = supabase
        .from("ai_tools")
        .select("*")
        .eq("is_active", true)
        .order("adoption_score", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search && search.trim().length > 0) {
        query = query.or(
          `name.ilike.%${search.trim()}%,maker.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AITool[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { tools, isLoading, error, refetch };
}

export function useAITool(slug: string | undefined) {
  const { data: tool, isLoading, error } = useQuery({
    queryKey: ["ai-tool", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data as AITool;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return { tool, isLoading, error };
}
