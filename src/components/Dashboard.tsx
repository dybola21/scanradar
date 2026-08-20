import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/scraper.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Search, Target } from "lucide-react";

export default function Dashboard() {
  const fetchStats = useServerFn(getDashboardStats);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchStats(),
  });

  const cards = [
    {
      title: "Total de Leads",
      value: stats?.totalLeads ?? 0,
      icon: Users,
      description: "Leads únicos gerados",
    },
    {
      title: "Buscas Realizadas",
      value: stats?.totalSearches ?? 0,
      icon: Search,
      description: "Total de processos de scraping",
    },
    {
      title: "Buscas Hoje",
      value: stats?.searchesToday ?? 0,
      icon: Target,
      description: "Atividade nas últimas 24h",
    },
    {
      title: "Leads Hoje",
      value: stats?.leadsToday ?? 0,
      icon: Users,
      description: "Novos leads encontrados hoje",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu sistema de leads.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : card.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
