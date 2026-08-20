import { Outlet, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Search, History, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Nova Busca", icon: Search, to: "/search" },
  { label: "Histórico", icon: History, to: "/history" },
  { label: "Configurações", icon: Settings, to: "/settings" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate({ to: "/auth" });
    }
  };

  const NavContent = () => (
    <div className="flex flex-col gap-2 p-4">
      {navItems.map((item) => (
        <Button
          key={item.to}
          variant="ghost"
          className="justify-start gap-2"
          asChild
        >
          <Link to={item.to} activeProps={{ className: "bg-muted" }}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
      <Button
        variant="ghost"
        className="mt-auto justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/20 md:block">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold">Maps Leads</span>
        </div>
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold">Maps Leads</span>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
          <span className="ml-4 text-lg font-bold">Maps Leads</span>
        </header>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
