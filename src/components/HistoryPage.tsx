import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSearchHistory } from "@/lib/scraper.functions";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Search } from "lucide-react";

export default function HistoryPage() {
  const fetchHistory = useServerFn(getSearchHistory);
  const { data: searches, isLoading } = useQuery({
    queryKey: ["search-history"],
    queryFn: () => fetchHistory(),
  });

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Buscas</h1>
          <p className="text-muted-foreground">Visualize e gerencie suas buscas passadas.</p>
        </div>
        <Button asChild>
          <Link to="/search">
            <Search className="mr-2 h-4 w-4" />
            Nova Busca
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Busca</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!searches || searches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma busca realizada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                searches.map((search) => (
                  <TableRow key={search.id}>
                    <TableCell className="font-medium capitalize">{search.termo}</TableCell>
                    <TableCell>{search.cidade} - {search.uf}</TableCell>
                    <TableCell>{new Date(search.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{search.total_leads || 0}</TableCell>
                    <TableCell>
                      <Badge variant={search.status === "completed" ? "default" : "secondary"}>
                        {search.status === "processing" ? "Em processamento" : 
                         search.status === "completed" ? "Concluído" : "Falhou"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/results/$searchId" params={{ searchId: search.id }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
