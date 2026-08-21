import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Chrome, Mail, Lock, ArrowRight, Target, Zap, ShieldCheck } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Cadastro realizado! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4 relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="inline-flex items-center justify-center p-4 rounded-[2rem] bg-[#16213B] mb-6 shadow-2xl shadow-blue-900/40 relative group"
          >
            <Zap className="h-8 w-8 text-blue-400 fill-blue-400/20 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-[2rem] border border-blue-400/20 animate-ping opacity-20" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black tracking-tighter text-[#16213B]"
          >
            ScanRadar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-2 opacity-60"
          >
            Lead Intelligence Engine
          </motion.p>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white/80 backdrop-blur-2xl overflow-hidden rounded-[2.5rem] border border-white/20">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />
          <CardHeader className="space-y-2 pt-10 px-10 text-center">
            <CardTitle className="text-3xl font-black tracking-tight text-[#16213B]">
              {isSignUp ? "Criar Acesso" : "Bem-vindo"}
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground/60 text-sm">
              {isSignUp 
                ? "Configure suas coordenadas de entrada." 
                : "Acesse sua central de comando agora."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4 px-10">
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    placeholder="E-mail operacional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-muted/30 border-none focus-visible:ring-primary/20 rounded-2xl transition-all font-bold"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Chave de segurança"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 bg-muted/30 border-none focus-visible:ring-primary/20 rounded-2xl transition-all font-bold"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-16 rounded-[1.25rem] text-lg font-black shadow-xl shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.98] transition-all group bg-[#16213B] text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Sincronizando...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {isSignUp ? "Ativar Minha Conta" : "Iniciar Sessão"}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
                <span className="bg-white px-4 text-muted-foreground/40">Gateway Seguro</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-border/60 bg-transparent font-black text-xs uppercase tracking-widest hover:bg-muted/50 transition-all flex items-center justify-center gap-3" 
              onClick={handleGoogleSignIn}
            >
              <Chrome className="h-4 w-4 text-[#16213B]" />
              Entrar com Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-6 pb-10 pt-2 px-10">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
            >
              {isSignUp ? "Já possuo coordenadas operacionalizadas" : "Não tenho acesso? Solicitar agora"}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/5 border border-green-500/10">
              <ShieldCheck className="h-3 w-3 text-green-600" />
              <span className="text-[9px] font-black text-green-700 uppercase tracking-tighter">Criptografia de Ponta-a-Ponta Ativa</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
