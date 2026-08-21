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
import { Search, Loader2, MapPin, Target, Sparkles, Info, ChevronDown, ChevronUp, SlidersHorizontal, Settings2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    searchMutation.mutate({ termo, cidade, uf });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16213B]/5 border border-[#16213B]/10 text-[#16213B] text-[10px] font-black uppercase tracking-[0.2em]">
          <Target className="h-3 w-3" />
          Engine Operacional v2.5
        </div>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-[#16213B]">
          Configurar Nova <span className="text-blue-600">Extração</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          Defina os parâmetros de busca. Nossa IA irá varrer o Google Maps em busca dos melhores leads qualificados para o seu negócio.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] bg-white overflow-hidden rounded-[2.5rem]">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#16213B]/5 text-[#16213B]">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Parâmetros de Busca</CardTitle>
                <CardDescription className="font-semibold text-muted-foreground/70">
                  Preencha os critérios de nicho e localização.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Nicho / Termo */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Sparkles className="h-3 w-3 text-blue-600" />
                    O que você procura? (Nicho)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors">
                      <Target className="h-5 w-5" />
                    </div>
                    <Input
                      placeholder="Ex: Restaurantes, Dentistas, Oficinas, TI..."
                      value={termo}
                      onChange={(e) => setTermo(e.target.value)}
                      required
                      className="pl-12 h-16 bg-muted/20 border-none focus-visible:ring-blue-600/20 rounded-2xl transition-all text-lg font-bold placeholder:font-medium tracking-tight"
                    />
                  </div>
                </div>

                {/* Cidade */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    Cidade
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <Input
                      placeholder="Ex: São Paulo"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      required
                      className="pl-12 h-16 bg-muted/20 border-none focus-visible:ring-blue-600/20 rounded-2xl transition-all text-lg font-bold placeholder:font-medium tracking-tight"
                    />
                  </div>
                </div>

                {/* UF */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Globe className="h-3 w-3 text-blue-600" />
                    Estado (UF)
                  </label>
                  <Select value={uf} onValueChange={setUf} required>
                    <SelectTrigger className="h-16 bg-muted/20 border-none focus:ring-blue-600/20 rounded-2xl text-lg font-bold tracking-tight">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 backdrop-blur-2xl">
                      <div className="grid grid-cols-4 gap-1 p-3">
                        {ESTADOS.map((estado) => (
                          <SelectItem 
                            key={estado} 
                            value={estado}
                            className="rounded-xl cursor-pointer focus:bg-primary/10 font-bold"
                          >
                            {estado}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors py-2 px-1 outline-none"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Parâmetros Avançados
                  <Settings2 className="h-4 w-4" />
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-6 pt-6 md:grid-cols-2">
                        <div className="p-5 rounded-2xl bg-muted/30 border border-dashed border-border/60">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Profundidade da Busca</p>
                          <p className="text-sm font-semibold text-muted-foreground/80">Busca completa habilitada por padrão. Nossa engine varre todos os registros disponíveis.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-muted/30 border border-dashed border-border/60">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Captura de Contatos</p>
                          <p className="text-sm font-semibold text-muted-foreground/80">Enriquecimento de e-mails e redes sociais via website (quando disponível).</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 md:h-20 rounded-[1.25rem] text-xl font-black shadow-2xl shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.98] transition-all group mt-6 bg-[#16213B] text-white" 
                disabled={searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <div className="flex items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    Processando Engine...
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Search className="h-7 w-7 group-hover:rotate-12 transition-transform" />
                    Lançar Radar de Prospecção
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Informative Guide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-[2rem] border border-[#16213B]/5 bg-white p-8 lg:p-10 flex flex-col md:flex-row gap-8 items-start shadow-sm"
      >
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-[#16213B]/5 flex items-center justify-center text-[#16213B] shadow-inner">
          <Info className="h-7 w-7" />
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-black tracking-tight">Como funciona o ScanRadar</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest">Fase 01</div>
              <p className="text-sm font-bold">Mapeamento Geográfico</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">Nossa IA acessa a API do Google Maps para localizar empresas do nicho solicitado na cidade alvo.</p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest">Fase 02</div>
              <p className="text-sm font-bold">Enriquecimento de Dados</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">Varremos os websites institucionais em busca de e-mails, perfis de Instagram e WhatsApp Business.</p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest">Fase 03</div>
              <p className="text-sm font-bold">Entrega Inteligente</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">Os leads são classificados por presença digital, destacando quem ainda não tem site como prioridade.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
