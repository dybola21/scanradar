import { Outlet, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Search, History, Settings, LogOut, Menu, User, Shield } from "lucide-react";
import { AnimatedRadarLogo } from "./AnimatedRadarLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Nova Busca", icon: Search, to: "/search" },
  { label: "Histórico", icon: History, to: "/history" },
  { label: "Configurações", icon: Settings, to: "/settings" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate({ to: "/auth" });
    }
  };

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full py-6">
      <div className="flex-1 space-y-2 px-3">
        {navItems.map((item) => (
          <Button
            key={item.to}
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-6 text-base font-semibold transition-all duration-200 hover:bg-primary/10 hover:text-primary group relative overflow-hidden"
            asChild
            onClick={() => mobile && setIsMobileMenuOpen(false)}
          >
            <Link 
              to={item.to} 
              activeProps={{ className: "bg-primary/10 text-primary shadow-sm" }}
            >
              <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              {item.label}
              <motion.div
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-primary rounded-full hidden"
              />
            </Link>
          </Button>
        ))}
      </div>

      <div className="mt-auto px-3 space-y-4">
        <div className="px-4 py-4 rounded-2xl bg-muted/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">Premium User</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                <Shield className="h-3 w-3 text-primary" />
                Plano Pro
              </div>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-6 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold transition-all"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 border-r border-border/40 bg-card/30 backdrop-blur-xl md:block fixed h-full z-20">
        <div className="flex h-20 items-center px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-[12px]"
            >
              <AnimatedRadarLogo size={38} />
              <span className="text-2xl font-black tracking-tighter text-foreground whitespace-nowrap">
                ScanRadar
              </span>
            </motion.div>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative">
        {/* Mobile Header */}
        <header className="flex h-20 items-center justify-between border-b border-border/40 bg-card/30 backdrop-blur-xl px-6 md:hidden sticky top-0 z-30">
          <Link to="/dashboard" className="flex items-center gap-3">
            <AnimatedRadarLogo size={32} />
            <span className="text-xl font-black tracking-tighter">ScanRadar</span>
          </Link>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/50">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-border/40">
              <div className="flex h-20 items-center border-b border-border/40 px-8 gap-3">
                <AnimatedRadarLogo size={32} />
                <span className="text-xl font-black tracking-tighter">ScanRadar</span>
              </div>
              <NavContent mobile />
            </SheetContent>
          </Sheet>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(var(--primary)/0.03),transparent_40%)] pointer-events-none" />
          <div className="p-6 md:p-10 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
