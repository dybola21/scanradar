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
import { Search, Loader2, MapPin, Target, Sparkles, Info } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          Nova Busca de Leads
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">
          Defina seu público-alvo e localização para iniciar a extração.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold">Parâmetros de Extração</CardTitle>
            </div>
            <CardDescription className="font-medium">
              O motor de IA irá processar os dados do Google Maps conforme os critérios abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  O que você procura? (Nicho)
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Ex: Restaurantes, Dentistas, Oficinas..."
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    required
                    className="pl-12 h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl transition-all text-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Cidade
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <Input
                      placeholder="Ex: São Paulo"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      required
                      className="pl-12 h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl transition-all text-lg font-medium"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Estado (UF)
                  </label>
                  <Select value={uf} onValueChange={setUf} required>
                    <SelectTrigger className="h-14 bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-lg font-medium">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 backdrop-blur-xl">
                      <div className="grid grid-cols-4 gap-1 p-2">
                        {ESTADOS.map((estado) => (
                          <SelectItem 
                            key={estado} 
                            value={estado}
                            className="rounded-lg cursor-pointer focus:bg-primary/10"
                          >
                            {estado}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all group mt-4" 
                disabled={searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Extraindo Dados...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Search className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    Iniciar Busca Inteligente
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-6 flex gap-4"
      >
        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="font-bold text-foreground">Fluxo de Extração</p>
          <ul className="text-sm text-muted-foreground space-y-2 font-medium">
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Sua solicitação é processada pelo workflow **n8n** seguro.
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Extração profunda de e-mails, websites e telefones comerciais.
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Resultados entregues em tempo real com classificação de presença digital.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
