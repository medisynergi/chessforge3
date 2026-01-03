import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Game, type Analysis } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";

export type GameWithAnalysis = Game & { analysis?: Analysis };

export function useGames() {
  return useQuery({
    queryKey: [api.games.list.path],
    queryFn: async () => {
      const res = await fetch(api.games.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch games history");
      return api.games.list.responses[200].parse(await res.json());
    },
  });
}

export function useGame(id: number) {
  return useQuery({
    queryKey: [api.games.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.games.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch game details");
      return api.games.get.responses[200].parse(await res.json());
    },
    // Poll while processing (simple implementation)
    refetchInterval: (query) => {
      const data = query.state.data as GameWithAnalysis | undefined;
      return data?.status === "analyzing" || data?.status === "pending" ? 2000 : false;
    },
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (pgn: string) => {
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pgn }),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.games.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit game for analysis");
      }
      
      return api.games.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
      // Redirect to the new game dashboard immediately
      setLocation(`/analysis/${data.id}`);
    },
  });
}
