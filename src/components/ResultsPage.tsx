import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSearchDetails } from "@/lib/scraper.functions";
import { useParams, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, ArrowLeft, Mail, Phone, Globe, MapPin } from "lucide-react";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";

export default function ResultsPage() {
  const { searchId } = useParams({ from: "/_authenticated/results/$searchId" });
  const fetchDetails = useServerFn(getSearchDetails);

  const { data, isLoading } = useQuery({
    queryKey: ["search-details", searchId],
    queryFn: () => fetchDetails({ data: { searchId } }),
    refetchInterval: (query) => {
      // Refetch if the search is not completed
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

  if (isLoading) return <div>Carregando resultados...</div>;
  if (!data) return <div>Busca não encontrada.</div>;

  const { search, leads } = data;

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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Com E-mail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.email || l.email2).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Com Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.website).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Encontrados</CardTitle>
          <CardDescription>Lista detalhada de empresas e contatos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Website</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {search.status === "processing" ? "Buscando leads..." : "Nenhum lead encontrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.telefone && (
                            <div className="flex items-center text-sm gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.telefone}
                            </div>
                          )}
                          {(lead.email || lead.email2) && (
                            <div className="flex items-center text-sm gap-1 text-primary">
                              <Mail className="h-3 w-3" />
                              {lead.email || lead.email2}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {lead.bairro ? `${lead.bairro}, ` : ""}{lead.cidade} - {lead.uf}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.website ? (
                          <a 
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            Site
                          </a>
                        ) : "-"}
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
