import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { startSearch } from "@/lib/scraper.functions";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function SearchPage() {
  const navigate = useNavigate();
  const startSearchFn = useServerFn(startSearch);

  const [termo, setTermo] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  const searchMutation = useMutation({
    mutationFn: (data: { termo: string; cidade: string; uf: string }) => 
      startSearchFn({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Busca iniciada com sucesso!");
        navigate({ to: "/results/$searchId", params: { searchId: result.searchId } });
      } else {
        toast.error("Erro ao iniciar busca: " + result.error);
      }
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termo || !cidade || !uf) {
      toast.error("Preencha todos os campos");
      return;
    }
    searchMutation.mutate({ termo, cidade, uf });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Nova Busca</h1>
        <p className="text-muted-foreground">Encontre novos leads no Google Maps.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros da Busca</CardTitle>
          <CardDescription>
            Defina o nicho e a localização para o scraping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">O que você procura? (Nicho)</label>
              <Input
                placeholder="Ex: Restaurantes, Dentistas, Oficinas..."
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado (UF)</label>
                <Select value={uf} onValueChange={setUf} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando Scraping...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Leads
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Como funciona:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Sua solicitação é enviada para o workflow n8n configurado.</li>
          <li>O scraping é executado em segundo plano.</li>
          <li>Os leads serão salvos no banco de dados assim que o processo terminar.</li>
          <li>Você poderá acompanhar o progresso e baixar os resultados em tempo real.</li>
        </ul>
      </div>
    </div>
  );
}
