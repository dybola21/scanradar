import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/results/$searchId")({
  component: ResultsPage,
});

function ResultsPage() {
  return null; // Will implement soon
}
