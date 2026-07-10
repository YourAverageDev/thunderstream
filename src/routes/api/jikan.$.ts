import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/jikan/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const path = (params as { _splat: string })._splat;
        const inUrl = new URL(request.url);
        const target = new URL(`https://api.jikan.moe/v4/${path}`);
        inUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));
        const res = await fetch(target.toString(), { headers: { accept: "application/json" } });
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
