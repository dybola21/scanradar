import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSearchHistory } from "@/lib/scraper.functions";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Search, Calendar, MapPin, Target, Clock, ArrowRight, Loader2, History, Filter, MoreHorizontal, Download, RefreshCw, FileText, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

export default function HistoryPage() {
  const fetchHistory = useServerFn(getSearchHistory);
  const { data: searches, isLoading } = useQuery({
    queryKey: ["search-history"],
    queryFn: () => fetchHistory(),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSearches = useMemo(() => {
    if (!searches) return [];
    return searches.filter(s => {
      const matchesText = s.termo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.cidade.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [searches, searchTerm, statusFilter]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <Loader2 className="h-14 w-14 text-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <History className="h-6 w-6 text-blue-600/50" />
        </div>
      </div>
      <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] animate-pulse">Recuperando Logs Operacionais...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16213B]/5 border border-[#16213B]/10 text-[#16213B] text-[10px] font-black uppercase tracking-[0.2em]">
            <History className="h-3 w-3" />
            Logs Operacionais
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-[#16213B]">
            Histórico de <span className="text-blue-600">Radar</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Auditoria de extrações e acesso aos bancos de dados coletados.</p>
        </div>
        <Button size="lg" className="h-16 px-8 rounded-2xl font-black shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-[#16213B] text-white" asChild>
          <Link to="/search">
            <Search className="mr-3 h-5 w-5" />
            Nova Extração
          </Link>
        </Button>
      </motion.div>

      {/* Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Pesquisar por nicho ou cidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 bg-white border-none shadow-sm rounded-xl font-bold placeholder:font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['all', 'completed', 'processing', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                statusFilter === status 
                  ? "bg-[#16213B] text-white shadow-xl shadow-blue-900/20" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {status === 'all' ? 'Todos' : 
               status === 'completed' ? 'Sucesso' : 
               status === 'processing' ? 'Em Curso' : 'Falha'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] bg-white overflow-hidden rounded-[2rem]">
          <CardContent className="p-0">
            {!filteredSearches || filteredSearches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center px-6">
                <div className="h-24 w-24 rounded-[2rem] bg-muted/50 flex items-center justify-center">
                  <History className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Nenhuma extração encontrada</h3>
                  <p className="text-muted-foreground font-medium max-w-xs mx-auto">Tente ajustar seus filtros ou inicie uma nova busca agora mesmo.</p>
                </div>
                <Button variant="outline" className="h-12 px-8 rounded-xl font-black border-blue-600/20 text-blue-600 hover:bg-blue-600/5 uppercase tracking-widest text-[10px]" asChild>
                  <Link to="/search">Começar Nova Busca</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent bg-muted/10">
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 px-8 h-auto">Nicho e Data</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 px-8 h-auto">Localização</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 px-8 h-auto">Métricas</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 px-8 h-auto">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 px-8 h-auto text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSearches.map((search) => (
                      <TableRow key={search.id} className="border-border/10 group hover:bg-primary/[0.02] transition-colors">
                        <TableCell className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-all shrink-0">
                              <Target className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-lg capitalize truncate tracking-tight">{search.termo}</p>
                              <div className="flex items-center gap-2 mt-1 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">
                                <Calendar className="h-3 w-3" />
                                {new Date(search.created_at).toLocaleDateString()}
                                <Clock className="h-3 w-3 ml-2" />
                                {new Date(search.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-black text-sm text-foreground/80">
                              <MapPin className="h-3.5 w-3.5 text-blue-600" />
                              {search.cidade}
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/60 ml-5 uppercase">{search.uf}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-black tabular-nums">{search.total_leads || 0}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Leads</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8">
                          <Badge 
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border-none tracking-widest shadow-sm",
                              search.status === "completed" ? "bg-green-500/10 text-green-600" : 
                              search.status === "processing" ? "bg-blue-600/10 text-blue-600 animate-pulse" : "bg-destructive/10 text-destructive"
                            )}
                          >
                            {search.status === "processing" ? "Extraindo..." : 
                             search.status === "completed" ? "Sucesso" : "Falha"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl hover:bg-blue-600/10 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                              title="Repetir Busca"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              className="h-11 px-6 rounded-xl font-black bg-[#16213B]/5 hover:bg-[#16213B] hover:text-white transition-all group/btn border-none text-[#16213B] shadow-sm uppercase tracking-widest text-[9px]"
                              asChild
                            >
                              <Link to="/results/$searchId" params={{ searchId: search.id }}>
                                <span>Relatório</span>
                                <FileText className="ml-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
