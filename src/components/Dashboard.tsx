import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/scraper.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Target, Mail, Globe } from "lucide-react";
import { motion } from "framer-motion";

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
      color: "text-blue-500",
    },
    {
      title: "Buscas Realizadas",
      value: stats?.totalSearches ?? 0,
      icon: Search,
      description: "Total de processos",
      color: "text-purple-500",
    },
    {
      title: "Com E-mail",
      value: stats?.leadsWithEmail ?? 0,
      icon: Mail,
      description: "Leads com contato direto",
      color: "text-green-500",
    },
    {
      title: "Com Website",
      value: stats?.leadsWithWebsite ?? 0,
      icon: Globe,
      description: "Presença digital detectada",
      color: "text-orange-500",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          Dashboard
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">
          Insights estratégicos e performance da sua geração de leads.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((card) => (
          <motion.div key={card.title} variants={item}>
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${card.color.replace('text', 'bg')}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black mt-2">
                  {isLoading ? (
                    <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Atividade Recente</h3>
              <p className="text-sm text-muted-foreground font-medium">Performance das últimas 24 horas</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-4xl font-black text-primary">{stats?.searchesToday ?? 0}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Novas Buscas</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-primary">{stats?.leadsToday ?? 0}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Novos Leads</p>
            </div>
          </div>
        </Card>
        
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md p-6 flex flex-col justify-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Gerar Novos Leads</h3>
            <p className="text-muted-foreground font-medium">
              Utilize nossa busca inteligente para extrair leads qualificados do Google Maps com um clique.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => window.location.href = '/search'}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
              >
                Iniciar Nova Busca
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
