import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/search")({
  component: () => <div>Search</div>,
});
