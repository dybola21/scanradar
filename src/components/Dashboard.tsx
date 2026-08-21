import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/scraper.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Search, Target, Mail, Globe, ArrowRight, Zap, TrendingUp, AlertCircle, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const fetchStats = useServerFn(getDashboardStats);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchStats(),
  });

  const kpis = [
    {
      title: "Total de Leads",
      value: stats?.totalLeads ?? 0,
      icon: Users,
      description: "Base total capturada",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Oportunidades",
      value: stats?.leadsWithoutWebsite ?? 0,
      icon: Target,
      description: "Leads sem website",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      trend: "Prioridade"
    },
    {
      title: "Contatos Diretos",
      value: stats?.leadsWithEmail ?? 0,
      icon: Mail,
      description: "E-mails validados",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      title: "Buscas",
      value: stats?.totalSearches ?? 0,
      icon: Search,
      description: "Processos concluídos",
      color: "text-[#16213B]",
      bgColor: "bg-[#16213B]/5",
      borderColor: "border-[#16213B]/10"
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[#16213B] p-8 lg:p-12 text-white shadow-2xl shadow-blue-900/20"
      >
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 rounded-full backdrop-blur-md">
            Visão Geral do ScanRadar
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Inteligência em <span className="text-blue-400">Prospecção</span>
          </h1>
          <p className="text-lg text-blue-100/70 font-medium max-w-lg">
            Sua engine de geração de leads está operando. Transforme buscas em oportunidades comerciais reais agora mesmo.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link 
              to="/search"
              className="px-8 py-4 rounded-2xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg shadow-white/10 active:scale-95"
            >
              <Zap className="h-5 w-5 fill-current" />
              Nova Extração
            </Link>
          </div>
        </div>
        
        {/* Abstract Radar Background Effect */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 border-[1px] border-blue-500/20 rounded-full animate-[pulse_4s_infinite]" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 border-[1px] border-blue-500/30 rounded-full animate-[pulse_3s_infinite]" />
      </motion.div>

      {/* KPI Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpis.map((kpi) => (
          <motion.div key={kpi.title} variants={item}>
            <Card className={cn("border bg-white shadow-sm transition-all duration-300 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 group rounded-[1.5rem]", kpi.borderColor)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className={cn("p-2.5 rounded-2xl transition-all group-hover:scale-110", kpi.bgColor, kpi.color)}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                {kpi.trend && (
                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-orange-500/30 text-orange-600 bg-orange-500/5">
                    {kpi.trend}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-4xl font-black tracking-tighter">
                  {isLoading ? (
                    <div className="h-10 w-20 bg-muted animate-pulse rounded-lg" />
                  ) : (
                    stats?.totalLeads === 0 && kpi.title === "Total de Leads" ? "0" : kpi.value.toLocaleString()
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-muted-foreground">{kpi.title}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground/60">{kpi.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Priority Opportunities */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Oportunidades de Alta Conversão</h2>
            </div>
            <Link to="/results/$searchId" params={{ searchId: stats?.recentSearches[0]?.id || 'all' }} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
              ))
            ) : stats?.priorityOpportunities && stats.priorityOpportunities.length > 0 ? (
              stats.priorityOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all group cursor-pointer overflow-hidden rounded-[1.25rem] bg-white">
                  <CardContent className="p-0">
                    <div className="flex items-center p-5 gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-orange-500/10 group-hover:text-orange-600 transition-colors shrink-0">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{opportunity.nome}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <MapPin className="h-3 w-3" /> {opportunity.cidade}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-orange-600 font-bold uppercase tracking-tighter bg-orange-500/5 px-2 py-0.5 rounded-md">
                            Sem Website Detectado
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {opportunity.telefone && (
                          <div className="p-2 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition-all">
                            <Phone className="h-4 w-4" />
                          </div>
                        )}
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-muted/20 p-12 text-center">
                <CardDescription className="text-base font-medium">
                  Nenhuma oportunidade detectada ainda. Inicie uma extração para ver os leads aqui.
                </CardDescription>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Recent Activity & Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white overflow-hidden rounded-[2rem]">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-black uppercase tracking-tight">Atividade Hoje</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Buscas</p>
                    <p className="text-2xl font-black">{stats?.searchesToday ?? 0}</p>
                  </div>
                  <div className="h-10 w-px bg-border/50" />
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Leads</p>
                    <p className="text-2xl font-black text-primary">{stats?.leadsToday ?? 0}</p>
                  </div>
                </div>
                
                <div className="pt-4 space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Últimas Buscas</p>
                  {stats?.recentSearches && stats.recentSearches.length > 0 ? (
                    stats.recentSearches.map((search) => (
                      <div key={search.id} className="flex items-center justify-between group cursor-pointer py-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            search.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-orange-500 animate-pulse'
                          )} />
                          <span className="text-sm font-bold truncate tracking-tight">{search.termo}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums group-hover:text-primary transition-colors">
                          {search.total_leads || 0} leads
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhuma atividade recente.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-[#16213B] text-primary-foreground p-8 rounded-[2rem] relative overflow-hidden group cursor-pointer" onClick={() => window.location.href='/history'}>
            <div className="absolute top-0 right-0 w-[40%] h-full bg-white/5 pointer-events-none skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
            <h3 className="text-lg font-black uppercase tracking-tighter">Explorar Histórico</h3>
            <p className="text-sm font-medium text-white/70 mt-1 mb-4">Acesse todos os seus dados capturados anteriormente.</p>
            <div className="flex items-center justify-end">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-all">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
