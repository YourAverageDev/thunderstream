import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/omdb")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env.OMDB_API_KEY || process.env.omdb_api_key;
        if (!apiKey) {
          return Response.json({ error: "OMDB_API_KEY is not configured." }, { status: 500 });
        }
        const inUrl = new URL(request.url);
        const target = new URL("https://www.omdbapi.com/");
        inUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));
        target.searchParams.set("apikey", apiKey);
        const res = await fetch(target.toString(), { headers: { accept: "application/json" } });
        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: {
            "content-type": res.headers.get("content-type") ?? "application/json",
            "cache-control": "public, max-age=600",
          },
        });
      },
    },
  },
});
