import { createFileRoute } from "@tanstack/react-router";

// AniList's GraphQL API (https://graphql.anilist.co) — proxied server-side so
// the client just POSTs { query, variables } to same-origin /api/anilist.
export const Route = createFileRoute("/api/anilist")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body,
        });
        const responseBody = await res.text();
        return new Response(responseBody, {
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
