import { Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Search, History, Settings, LogOut, Menu, User, Shield, ChevronLeft, ChevronRight, Activity } from "lucide-react";
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
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEngineConnected, setIsEngineConnected] = useState(true); // Placeholder for engine status

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
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Button
              key={item.to}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-3 py-6 text-sm font-black uppercase tracking-widest transition-all duration-200 group relative overflow-hidden rounded-xl",
                isActive ? "bg-[#16213B] text-white shadow-xl shadow-blue-900/20" : "hover:bg-[#16213B]/5 text-muted-foreground hover:text-[#16213B]",
                isCollapsed && !mobile && "justify-center px-0"
              )}
              asChild
              onClick={() => mobile && setIsMobileMenuOpen(false)}
            >
              <Link to={item.to}>
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110 shrink-0", !isCollapsed || mobile ? "" : "mx-auto")} />
                {(!isCollapsed || mobile) && <span>{item.label}</span>}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-0 w-1 h-6 bg-primary-foreground rounded-l-full"
                  />
                )}
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="mt-auto px-3 space-y-4">
        {/* Engine Status */}
        <div className={cn(
          "px-4 py-3 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm transition-all",
          isCollapsed && !mobile ? "px-2 items-center justify-center flex" : ""
        )}>
          <div className={cn("flex items-center gap-3", isCollapsed && !mobile ? "flex-col gap-1" : "")}>
            <div className={cn(
              "h-2 w-2 rounded-full",
              isEngineConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"
            )} />
            {(!isCollapsed || mobile) && (
              <div className="flex items-center gap-2 overflow-hidden">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">
                  n8n Engine: {isEngineConnected ? "Online" : "Offline"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Card */}
        <div className={cn(
          "px-4 py-4 rounded-2xl bg-muted/50 border border-border/50 backdrop-blur-sm transition-all",
          isCollapsed && !mobile ? "px-2" : ""
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-[#16213B]/5 text-[#16213B] border border-[#16213B]/10 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            {(!isCollapsed || mobile) && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-foreground">Premium User</p>
                <div className="flex items-center gap-1 text-[10px] text-primary uppercase tracking-widest font-black">
                  <Shield className="h-3 w-3" />
                  Operador Premium
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-4 py-6 text-destructive/70 hover:bg-destructive/10 hover:text-destructive font-black uppercase tracking-widest text-[10px] transition-all rounded-xl",
            isCollapsed && !mobile && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!isCollapsed || mobile) && <span>Desconectar Radar</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden border-r border-border/40 bg-card/30 backdrop-blur-xl md:block fixed h-full z-40 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}>
        <div className="flex h-20 items-center px-4 relative">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-[10px] min-h-[44px] cursor-pointer outline-none transition-all duration-300"
            aria-label="Ir para o Dashboard"
          >
            <div className="shrink-0 ml-2">
              <AnimatedRadarLogo size={34} />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[20px] font-[750] tracking-[-0.02em] leading-none text-foreground whitespace-nowrap translate-y-[-1px]"
              >
                ScanRadar
              </motion.span>
            )}
          </Link>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-border/10 hover:scale-110 active:scale-95 transition-all z-50"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>
        <NavContent />
      </aside>
      
      {/* Spacer for fixed sidebar */}
      <div className={cn("hidden md:block transition-all duration-300", isCollapsed ? "w-20" : "w-72")} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Mobile Header */}
        <header className="flex h-20 items-center justify-between border-b border-border/40 bg-card/30 backdrop-blur-xl px-6 md:hidden sticky top-0 z-30">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-[10px] min-h-[44px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg transition-all"
            aria-label="Ir para o Dashboard"
          >
            <AnimatedRadarLogo size={34} />
            <span className="text-[20px] font-[750] tracking-[-0.02em] leading-none text-foreground whitespace-nowrap translate-y-[-1px] m-0 p-0">
              ScanRadar
            </span>
          </Link>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/50">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-border/40">
              <div className="flex h-20 items-center border-b border-border/40 px-8 gap-3">
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-[10px] min-h-[44px] cursor-pointer outline-none"
                  aria-label="Ir para o Dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <AnimatedRadarLogo size={34} />
                  <span className="text-[20px] font-[750] tracking-[-0.02em] leading-none text-foreground whitespace-nowrap translate-y-[-1px] m-0 p-0">
                    ScanRadar
                  </span>
                </Link>
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
                key={location.pathname}
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
