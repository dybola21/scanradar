import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/results/$searchId")({
  component: () => <div>Results</div>,
});
