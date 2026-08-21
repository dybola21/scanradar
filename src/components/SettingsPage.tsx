import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getIntegrationSettings, updateIntegrationSettings, testIntegration } from "@/lib/scraper.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Settings2, Link2, Key, Info, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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
      toast.success("Configurações atualizadas com sucesso!");
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
        toast.success("Conexão estabelecida com sucesso!");
      } else {
        toast.error("Erro na integração: " + result.error);
      }
    } catch (error: any) {
      toast.error("Falha no teste: " + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Carregando configurações...</p>
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto space-y-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          Configurações de Engine
        </h1>
        <p className="text-muted-foreground font-medium mt-1">Conecte sua conta n8n para orquestrar as extrações.</p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Integração n8n</CardTitle>
                  <CardDescription className="font-medium">Webhooks para processamento assíncrono.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                    <Info className="h-3 w-3" /> Nome da Instância
                  </label>
                  <Input
                    placeholder="Ex: n8n Production Engine"
                    value={integrationName}
                    onChange={(e) => setIntegrationName(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/50 border-none shadow-inner font-semibold px-6 focus-visible:ring-primary/30"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                    <Link2 className="h-3 w-3" /> Webhook URL (POST)
                  </label>
                  <Input
                    placeholder="https://n8n.domain.com/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/50 border-none shadow-inner font-semibold px-6 focus-visible:ring-primary/30"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                    <Key className="h-3 w-3" /> API Secret
                  </label>
                  <Input
                    type="password"
                    placeholder={settings?.webhook_secret ? "••••••••••••••••" : "Insira o token de segurança"}
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/50 border-none shadow-inner font-semibold px-6 focus-visible:ring-primary/30"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit" 
                    className="h-14 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 flex-1 hover:scale-[1.02] transition-transform" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleTest}
                    disabled={isTesting || !webhookUrl}
                    className="h-14 px-8 rounded-2xl font-bold border-border/50 flex-1 bg-card/50 hover:bg-muted transition-colors"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      "Testar Conexão"
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
          className="space-y-6"
        >
          <Card className="border-none shadow-xl bg-primary/5 rounded-[2rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold">Segurança</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-sm font-medium leading-relaxed text-muted-foreground">
              Seus dados de integração são criptografados no backend. 
              <span className="block mt-3 text-foreground/80">
                O Lovable Cloud gerencia os segredos via Server Functions, garantindo que nenhum token vaze para o navegador.
              </span>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-muted/30 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg font-bold">Checklist</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {[
                "Workflow n8n ativo",
                "Node de Webhook configurado",
                "X-Webhook-Secret validado",
                "Leads retornados via JSON"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs font-bold text-foreground/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
