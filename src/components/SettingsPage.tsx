import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getIntegrationSettings, updateIntegrationSettings, testIntegration } from "@/lib/scraper.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Settings2 } from "lucide-react";

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
      setWebhookSecret(""); // Don't show the dummy dots when editing
      setIntegrationName(settings.integration_name);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: { webhook_url: string; webhook_secret?: string | null; integration_name: string }) => 
      updateSettingsFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["n8n-settings"] });
      toast.success("Configurações salvas com sucesso!");
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
        toast.error("Falha na conexão: " + result.error);
      }
    } catch (error: any) {
      toast.error("Erro ao testar conexão: " + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie a integração com o workflow n8n.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            <CardTitle>Integração n8n</CardTitle>
          </div>
          <CardDescription>
            Configure o webhook do seu workflow n8n que processa o scraping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Integração</label>
              <Input
                placeholder="Ex: n8n Produção"
                value={integrationName}
                onChange={(e) => setIntegrationName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL do Webhook</label>
              <Input
                placeholder="https://n8n.exemplo.com/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Segredo do Webhook (X-Webhook-Secret)</label>
              <Input
                type="password"
                placeholder={settings?.webhook_secret ? "••••••••••••••••" : "Insira o segredo para autenticação"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                Salvar Configurações
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTest}
                disabled={isTesting || !webhookUrl}
              >
                {isTesting ? "Testando..." : "Testar Conexão"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Segurança</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-primary/80">
          Suas credenciais são armazenadas de forma segura no backend e nunca são expostas ao navegador. 
          Toda comunicação com o n8n é feita através de server functions protegidas.
        </CardContent>
      </Card>
    </div>
  );
}
