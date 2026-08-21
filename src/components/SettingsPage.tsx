import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getIntegrationSettings, updateIntegrationSettings, testIntegration } from "@/lib/scraper.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Settings2, Link2, Key, Info, CheckCircle2, AlertCircle, Loader2, Zap, Activity, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Settings() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getIntegrationSettings);
  const updateSettingsFn = useServerFn(updateIntegrationSettings);
  const testFn = useServerFn(testIntegration);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["n8n-settings"],
    queryFn: () => fetchSettings(),
  });

  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [integrationName, setIntegrationName] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings) {
      setWebhookUrl(settings.webhook_url);
      setWebhookSecret(""); 
      setIntegrationName(settings.integration_name);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: { webhook_url: string; webhook_secret?: string | null; integration_name: string }) => 
      updateSettingsFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["n8n-settings"] });
      toast.success("Configurações operacionalizadas com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ 
      webhook_url: webhookUrl, 
      webhook_secret: webhookSecret || null, 
      integration_name: integrationName || "n8n integration" 
    });
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testFn();
      if (result.success) {
        toast.success("Engine ScanRadar conectada com sucesso!");
      } else {
        toast.error("Erro na integração: " + result.error);
      }
    } catch (error: any) {
      toast.error("Falha no teste: " + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <Loader2 className="h-14 w-14 text-primary animate-spin" />
        <Zap className="absolute inset-0 m-auto h-6 w-6 text-primary/50" />
      </div>
      <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Sincronizando Engine...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
          <Settings2 className="h-3 w-3" />
          Infraestrutura de Dados
        </div>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none">
          Configurações da <span className="text-primary">Engine</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          Conecte sua engine n8n para gerenciar as automações de extração e processamento de leads.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/10">
            <div className="h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Endpoint de Integração</CardTitle>
                  <CardDescription className="font-semibold text-muted-foreground/70">Configure o canal de comunicação com sua automação.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-primary" /> Identificador da Instância
                  </label>
                  <Input
                    placeholder="Ex: ScanRadar Main Engine"
                    value={integrationName}
                    onChange={(e) => setIntegrationName(e.target.value)}
                    className="h-16 rounded-2xl bg-muted/20 border-border/50 shadow-inner font-bold px-6 text-lg tracking-tight"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-primary" /> Webhook URL (n8n node)
                  </label>
                  <div className="relative group">
                    <Input
                      placeholder="https://n8n.seuservidor.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="h-16 rounded-2xl bg-muted/20 border-border/50 shadow-inner font-bold pl-6 pr-14 text-lg tracking-tight"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-primary" /> Chave de Segurança (Header)
                  </label>
                  <Input
                    type="password"
                    placeholder={settings?.webhook_secret ? "••••••••••••••••" : "Token X-Webhook-Secret"}
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="h-16 rounded-2xl bg-muted/20 border-border/50 shadow-inner font-bold px-6 text-lg tracking-tight"
                  />
                  <p className="text-[10px] text-muted-foreground font-bold px-1 uppercase tracking-tighter">Essa chave será enviada no header da requisição para validar a origem.</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit" 
                    className="h-16 px-10 rounded-2xl font-black shadow-xl shadow-primary/20 flex-1 hover:scale-[1.01] active:scale-[0.99] transition-all text-lg bg-primary text-primary-foreground" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Persistindo...
                      </div>
                    ) : "Salvar Configurações"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleTest}
                    disabled={isTesting || !webhookUrl}
                    className="h-16 px-10 rounded-2xl font-black border-primary/20 flex-1 bg-primary/5 hover:bg-primary/10 text-primary transition-all text-lg"
                  >
                    {isTesting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Validando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Testar Conexão
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Status Indicator Card */}
          <Card className={cn(
            "border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-500",
            settings?.is_connected ? "bg-green-500/10" : "bg-orange-500/10"
          )}>
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                  settings?.is_connected ? "bg-green-500/20 text-green-600" : "bg-orange-500/20 text-orange-600"
                )}>
                  <Activity className="h-6 w-6" />
                </div>
                <Badge className={cn(
                  "px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border-none",
                  settings?.is_connected ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                )}>
                  {settings?.is_connected ? "Conectado" : "Pendente"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-2">
              <h3 className="text-xl font-black tracking-tight">Status da Engine</h3>
              <p className="text-sm font-semibold text-muted-foreground/80 leading-relaxed">
                {settings?.is_connected 
                  ? "Sua engine está sincronizada e pronta para processar extrações profundas." 
                  : "Aguardando teste de conexão para habilitar o fluxo de extração de leads."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-border/40">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-black uppercase tracking-tight">Segurança de Dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-4 text-sm font-semibold leading-relaxed text-muted-foreground/80">
              <p>Os segredos de sua engine são armazenados exclusivamente em ambiente seguro da <span className="text-primary font-black">Lovable Cloud</span>.</p>
              <div className="space-y-3 pt-2">
                {[
                  "Workflow n8n operando",
                  "Webhook Node configurado",
                  "Autenticação por Header ativa",
                  "SSL/TLS Obrigatório"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/70">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
