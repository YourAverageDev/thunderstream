import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tmdb/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const apiKey = process.env.TMDB_API_KEY || process.env.tmdb_api_key;
        if (!apiKey) {
          return Response.json({ error: "TMDB API key is not configured. Add TMDB_API_KEY in your deployment environment variables." }, { status: 500 });
        }
        const path = (params as { _splat: string })._splat;
        const inUrl = new URL(request.url);
        const target = new URL(`https://api.themoviedb.org/3/${path}`);
        inUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));
        target.searchParams.set("api_key", apiKey);

        const res = await fetch(target.toString(), {
          headers: { accept: "application/json" },
        });
        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: {
            "content-type": res.headers.get("content-type") ?? "application/json",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
