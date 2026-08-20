import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/search")({
  component: SearchPage,
});

function SearchPage() {
  return null; // Will implement soon
}
