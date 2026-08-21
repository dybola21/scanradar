import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSearchDetails } from "@/lib/scraper.functions";
import { useParams, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, ArrowLeft, Mail, Phone, Globe, MapPin, Filter, SortAsc } from "lucide-react";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";
import { classifyWebsiteUrl, type WebsiteClassification } from "@/lib/website-utils";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const { searchId } = useParams({ from: "/_authenticated/results/$searchId" });
  const fetchDetails = useServerFn(getSearchDetails);
  
  const [presenceFilter, setPresenceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("opportunity");

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
    toast.success("Exportação iniciada!");
  };

  const handleExportExcel = () => {
    if (!data?.leads) return;
    exportToExcel(data.leads, `leads-${data.search.termo}-${data.search.cidade}.xlsx`);
    toast.success("Exportação iniciada!");
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
      case "own_website": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
      case "whatsapp": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
      case "instagram": return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400";
      case "no_link": return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
      case "url_shortener":
      case "unknown": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  if (isLoading) return <div>Carregando resultados...</div>;
  if (!search) return <div>Busca não encontrada.</div>;



  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/history">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold capitalize">{search.termo} em {search.cidade}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{new Date(search.created_at).toLocaleString()}</span>
              <Badge variant={search.status === "completed" ? "default" : "secondary"}>
                {search.status === "processing" ? "Em processamento" : 
                 search.status === "completed" ? "Concluído" : "Falhou"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={!leads.length}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel} disabled={!leads.length}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          {search.sheet_url && (
            <Button asChild>
              <a href={search.sheet_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Planilha Google
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sem Site Próprio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.noOwn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Com Site Próprio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.withOwn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Indeterminados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.indeterminate}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-64 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" /> Presença digital
          </label>
          <Select value={presenceFilter} onValueChange={setPresenceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="no_own_site">Sem site próprio</SelectItem>
              <SelectItem value="with_own_site">Com site próprio</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="social">Outras redes sociais</SelectItem>
              <SelectItem value="bio">Link de bio</SelectItem>
              <SelectItem value="platform">Página em plataforma</SelectItem>
              <SelectItem value="shortener">Link encurtado</SelectItem>
              <SelectItem value="none">Sem link</SelectItem>
              <SelectItem value="unknown">Não identificado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <SortAsc className="h-4 w-4" /> Ordenação
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunity">Melhores oportunidades</SelectItem>
              <SelectItem value="site">Com site próprio</SelectItem>
              <SelectItem value="name">Nome da empresa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Encontrados</CardTitle>
          <CardDescription>Lista detalhada de empresas e contatos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead className="min-w-[200px]">Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Website / Presença Digital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {search.status === "processing" ? "Buscando leads..." : "Nenhum lead encontrado com estes filtros."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 space-y-3 md:space-y-0">
                      <TableCell className="font-medium p-0 md:p-4 text-lg md:text-base">
                        <span className="md:hidden text-xs text-muted-foreground block mb-1">Empresa</span>
                        {lead.nome}
                      </TableCell>
                      <TableCell className="p-0 md:p-4">
                        <span className="md:hidden text-xs text-muted-foreground block mb-1">Contato</span>
                        <div className="space-y-1">
                          {lead.telefone && (
                            <div className="flex items-center text-sm gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.telefone}
                            </div>
                          )}
                          {(lead.email || lead.email2) && (
                            <div className="flex items-center text-sm gap-1 text-primary break-all">
                              <Mail className="h-3 w-3" />
                              {lead.email || lead.email2}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-0 md:p-4">
                        <span className="md:hidden text-xs text-muted-foreground block mb-1">Localização</span>
                        <div className="flex items-center text-sm gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {lead.bairro ? `${lead.bairro}, ` : ""}{lead.cidade} - {lead.uf}
                        </div>
                      </TableCell>
                      <TableCell className="p-0 md:p-4">
                        <span className="md:hidden text-xs text-muted-foreground block mb-1">Website / Presença Digital</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("px-2 py-0.5", getBadgeColor(lead.classification.type))}>
                              {lead.classification.label}
                            </Badge>
                            {lead.classification.normalizedUrl && (
                              <a 
                                href={lead.classification.normalizedUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] uppercase font-bold tracking-tight">
                            {lead.classification.hasOwnWebsite === true && (
                              <span className="text-green-600 dark:text-green-400">Site próprio: Sim</span>
                            )}
                            {lead.classification.hasOwnWebsite === false && (
                              <span className="text-red-600 dark:text-red-400">Site próprio: Não</span>
                            )}
                            {lead.classification.hasOwnWebsite === null && (
                              <span className="text-yellow-600 dark:text-yellow-400">Site próprio: Indeterminado</span>
                            )}
                          </div>
                          {lead.classification.hostname && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              {lead.classification.hostname}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
