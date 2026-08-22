import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

// teste
// Copie todos os arquivos desse repositório do github para nosso projeto atual
// https://github.com/dybola21/scanradar-4e33d5ff.git
