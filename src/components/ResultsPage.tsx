import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSearchDetails } from "@/lib/scraper.functions";
import { useParams, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, ArrowLeft, Mail, Phone, Globe, MapPin, Filter, SortAsc, LayoutGrid, List, CheckCircle2, Clock, AlertCircle, Search, Target, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";
import { classifyWebsiteUrl, type WebsiteClassification } from "@/lib/website-utils";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ResultsPage() {
  const { searchId } = useParams({ from: "/_authenticated/results/$searchId" });
  const fetchDetails = useServerFn(getSearchDetails);
  
  const [presenceFilter, setPresenceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("opportunity");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { data, isLoading } = useQuery({
    queryKey: ["search-details", searchId],
    queryFn: () => fetchDetails({ data: { searchId } }),
    refetchInterval: (query) => {
      return query.state.data?.search.status === "processing" ? 3000 : false;
    },
  });

  const handleExportCSV = () => {
    if (!data?.leads) return;
    exportToCSV(data.leads, `leads-${data.search.termo}-${data.search.cidade}.csv`);
    toast.success("Exportação CSV iniciada!");
  };

  const handleExportExcel = () => {
    if (!data?.leads) return;
    exportToExcel(data.leads, `leads-${data.search.termo}-${data.search.cidade}.xlsx`);
    toast.success("Exportação Excel iniciada!");
  };

  const leads = data?.leads ?? [];
  const search = data?.search;

  const leadsWithClassification = useMemo(() => {
    return leads.map(lead => ({
      ...lead,
      classification: classifyWebsiteUrl(lead.website)
    }));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = [...leadsWithClassification];

    if (presenceFilter !== "all") {
      result = result.filter(lead => {
        const c = lead.classification;
        switch (presenceFilter) {
          case "no_own_site": return c.hasOwnWebsite === false;
          case "with_own_site": return c.hasOwnWebsite === true;
          case "whatsapp": return c.type === "whatsapp";
          case "instagram": return c.type === "instagram";
          case "social": return c.type === "social_network";
          case "bio": return c.type === "link_in_bio";
          case "platform": return c.type === "marketplace_or_platform";
          case "shortener": return c.type === "url_shortener";
          case "none": return c.type === "no_link";
          case "unknown": return c.type === "unknown";
          default: return true;
        }
      });
    }

    result.sort((a, b) => {
      if (sortBy === "opportunity") {
        const score = (c: WebsiteClassification) => {
          const priorities: Record<string, number> = {
            "no_link": 1,
            "whatsapp": 2,
            "instagram": 3,
            "link_in_bio": 4,
            "social_network": 5,
            "marketplace_or_platform": 6,
            "url_shortener": 7,
            "unknown": 8,
            "own_website": 9
          };
          return priorities[c.type] || 10;
        };
        return score(a.classification) - score(b.classification);
      }
      if (sortBy === "site") {
        if (a.classification.hasOwnWebsite === b.classification.hasOwnWebsite) return 0;
        return a.classification.hasOwnWebsite ? -1 : 1;
      }
      if (sortBy === "name") {
        return (a.nome || "").localeCompare(b.nome || "");
      }
      return 0;
    });

    return result;
  }, [leadsWithClassification, presenceFilter, sortBy]);

  const stats = useMemo(() => {
    const total = leadsWithClassification.length;
    const noOwn = leadsWithClassification.filter(l => l.classification.hasOwnWebsite === false).length;
    const withOwn = leadsWithClassification.filter(l => l.classification.hasOwnWebsite === true).length;
    const indeterminate = leadsWithClassification.filter(l => l.classification.hasOwnWebsite === null).length;
    return { total, noOwn, withOwn, indeterminate };
  }, [leadsWithClassification]);

  const getBadgeColor = (type: WebsiteClassification["type"]) => {
    switch (type) {
      case "own_website": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "whatsapp": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "instagram": return "bg-pink-500/10 text-pink-600 border-pink-500/20";
      case "no_link": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      case "url_shortener":
      case "unknown": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Carregando inteligência de dados...</p>
    </div>
  );
  
  if (!search) return (
    <div className="text-center py-20 space-y-4">
      <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
      <h2 className="text-2xl font-bold">Busca não encontrada</h2>
      <Button asChild>
        <Link to="/history">Voltar ao histórico</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-muted" asChild>
            <Link to="/history">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight capitalize bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              {search.termo} <span className="text-foreground/40 font-medium lowercase">em</span> {search.cidade}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-widest border border-border/50">
                <Clock className="h-3 w-3" />
                {new Date(search.created_at).toLocaleDateString()}
              </div>
              <Badge 
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-none",
                  search.status === "completed" ? "bg-green-500/10 text-green-600" : 
                  search.status === "processing" ? "bg-primary/10 text-primary animate-pulse" : "bg-destructive/10 text-destructive"
                )}
              >
                {search.status === "processing" ? "Processando" : 
                 search.status === "completed" ? "Finalizado" : "Erro"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("rounded-lg h-9 px-3", viewMode === "table" && "bg-background shadow-sm text-primary")}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4 mr-2" /> Tabela
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("rounded-lg h-9 px-3", viewMode === "grid" && "bg-background shadow-sm text-primary")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Grid
            </Button>
          </div>
          
          <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-border/50 hover:bg-muted/50" onClick={handleExportCSV} disabled={!leads.length}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-border/50 hover:bg-muted/50" onClick={handleExportExcel} disabled={!leads.length}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
          {search.sheet_url && (
            <Button className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20" asChild>
              <a href={search.sheet_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Planilha
              </a>
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: "Total Extraído", value: stats.total, color: "text-foreground" },
          { label: "Oportunidade (Sem Site)", value: stats.noOwn, color: "text-orange-500", highlight: true },
          { label: "Presença Digital (Com Site)", value: stats.withOwn, color: "text-green-500" },
          { label: "Dados Inconclusivos", value: stats.indeterminate, color: "text-amber-500" },
        ].map((s, idx) => (
          <Card key={idx} className={cn("border-none shadow-xl bg-card/50 backdrop-blur-xl group overflow-hidden relative", s.highlight && "ring-1 ring-orange-500/20")}>
            {s.highlight && <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8" />}
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-4xl font-black transition-transform group-hover:scale-105 duration-300", s.color)}>
                {s.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="w-full md:w-80 space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
            <Filter className="h-3 w-3" /> Filtrar Presença Digital
          </label>
          <Select value={presenceFilter} onValueChange={setPresenceFilter}>
            <SelectTrigger className="h-12 rounded-xl bg-card/50 backdrop-blur-md border-none shadow-lg shadow-black/5 font-semibold">
              <SelectValue placeholder="Selecione o filtro..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 backdrop-blur-2xl">
              <SelectItem value="all">Todos os Leads</SelectItem>
              <SelectItem value="no_own_site">Sem Site Próprio (Foco)</SelectItem>
              <SelectItem value="with_own_site">Com Site Próprio</SelectItem>
              <SelectItem value="whatsapp">Apenas WhatsApp</SelectItem>
              <SelectItem value="instagram">Apenas Instagram</SelectItem>
              <SelectItem value="bio">Links de Bio (Linktree, etc)</SelectItem>
              <SelectItem value="none">Sem links externos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-80 space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
            <SortAsc className="h-3 w-3" /> Inteligência de Ordenação
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-12 rounded-xl bg-card/50 backdrop-blur-md border-none shadow-lg shadow-black/5 font-semibold">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 backdrop-blur-2xl">
              <SelectItem value="opportunity">Melhores Oportunidades</SelectItem>
              <SelectItem value="name">Alfabética (Empresa)</SelectItem>
              <SelectItem value="site">Status Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="rounded-3xl border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6 px-8">Empresa</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6 px-8">Contato Estratégico</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6 px-8 text-center">Status Digital</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest py-6 px-8 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                          <Search className="h-12 w-12 opacity-20" />
                          <p className="font-bold">Nenhum lead encontrado com estes filtros.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead, idx) => (
                      <TableRow key={lead.id} className="border-border/20 group hover:bg-primary/5 transition-colors">
                        <TableCell className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center font-black text-foreground/40 text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-lg leading-tight">{lead.nome}</p>
                              <div className="flex items-center gap-1.5 mt-1 text-muted-foreground font-medium text-sm">
                                <MapPin className="h-3 w-3" />
                                {lead.cidade}, {lead.uf}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8">
                          <div className="space-y-1.5">
                            {lead.telefone && (
                              <div className="flex items-center gap-2 font-bold text-sm">
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                {lead.telefone}
                              </div>
                            )}
                            {(lead.email || lead.email2) && (
                              <div className="flex items-center gap-2 font-semibold text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer truncate max-w-[200px]">
                                <Mail className="h-3.5 w-3.5" />
                                {lead.email || lead.email2}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border-none", getBadgeColor(lead.classification.type))}>
                              {lead.classification.label}
                            </Badge>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", lead.classification.hasOwnWebsite ? "text-green-500/60" : "text-orange-500/60")}>
                              {lead.classification.hasOwnWebsite ? "Site Próprio" : "Sem Site"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {lead.classification.normalizedUrl && (
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary" asChild>
                                <a href={lead.classification.normalizedUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-5 w-5" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                              <Target className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="border-none shadow-xl bg-card/50 backdrop-blur-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group overflow-hidden">
                <div className={cn("h-1.5 w-full", lead.classification.hasOwnWebsite ? "bg-green-500" : "bg-orange-500")} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{lead.nome}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1 font-semibold">
                        <MapPin className="h-3 w-3" /> {lead.cidade} - {lead.uf}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border-none shrink-0", getBadgeColor(lead.classification.type))}>
                      {lead.classification.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {lead.telefone && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20 group-hover:bg-primary/5 transition-colors">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm tracking-tighter">{lead.telefone}</span>
                      </div>
                    )}
                    {(lead.email || lead.email2) && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20 group-hover:bg-primary/5 transition-colors">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-bold text-xs truncate">{lead.email || lead.email2}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 flex gap-3">
                    {lead.classification.normalizedUrl && (
                      <Button className="flex-1 rounded-xl h-11 font-bold shadow-sm" asChild>
                        <a href={lead.classification.normalizedUrl} target="_blank" rel="noopener noreferrer">
                          Acessar Link
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-border/50">
                      Prospectar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
