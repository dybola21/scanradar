import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSearchHistory } from "@/lib/scraper.functions";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, Calendar, MapPin, Target, Clock, ArrowRight, Loader2, History } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const fetchHistory = useServerFn(getSearchHistory);
  const { data: searches, isLoading } = useQuery({
    queryKey: ["search-history"],
    queryFn: () => fetchHistory(),
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Recuperando seu histórico...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <History className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              Histórico de Buscas
            </h1>
            <p className="text-muted-foreground font-medium mt-1">Gerencie e analise suas extrações passadas.</p>
          </div>
        </div>
        <Button size="lg" className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
          <Link to="/search">
            <Search className="mr-2 h-5 w-5" />
            Nova Extração
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden rounded-[2rem]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8 px-8">Extração</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8 px-8">Localização</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8 px-8">Informações</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8 px-8 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!searches || searches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-32">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                          <History className="h-16 w-16 opacity-10" />
                          <p className="font-bold text-lg">Nenhuma extração realizada ainda.</p>
                          <Button variant="link" className="text-primary font-bold" asChild>
                            <Link to="/search">Começar agora</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    searches.map((search, idx) => (
                      <TableRow key={search.id} className="border-border/20 group hover:bg-primary/[0.03] transition-colors">
                        <TableCell className="py-8 px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center font-black text-foreground/30 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-lg capitalize">{search.termo}</p>
                              <div className="flex items-center gap-2 mt-1 text-muted-foreground text-xs font-semibold">
                                <Clock className="h-3 w-3" />
                                {new Date(search.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-8 px-8">
                          <div className="flex items-center gap-2 font-bold text-sm text-foreground/70">
                            <MapPin className="h-4 w-4 text-primary" />
                            {search.cidade} - {search.uf}
                          </div>
                        </TableCell>
                        <TableCell className="py-8 px-8">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Leads</span>
                              <Badge variant="outline" className="w-fit rounded-lg px-2 font-black border-border/50 bg-background/50">
                                {search.total_leads || 0}
                              </Badge>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Status</span>
                              <Badge 
                                className={cn(
                                  "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border-none",
                                  search.status === "completed" ? "bg-green-500/10 text-green-600" : 
                                  search.status === "processing" ? "bg-primary/10 text-primary animate-pulse" : "bg-destructive/10 text-destructive"
                                )}
                              >
                                {search.status === "processing" ? "Em Curso" : 
                                 search.status === "completed" ? "Finalizado" : "Erro"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-8 px-8 text-right">
                          <Button 
                            className="h-11 px-6 rounded-xl font-bold bg-muted/50 hover:bg-primary hover:text-white transition-all group/btn border-none text-foreground"
                            asChild
                          >
                            <Link to="/results/$searchId" params={{ searchId: search.id }}>
                              Abrir Dados
                              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
