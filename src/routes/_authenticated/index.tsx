import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/index")({
  component: Dashboard,
});

function Dashboard() {
  return null; // Will implement soon
}
