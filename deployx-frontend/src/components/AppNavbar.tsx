import { useEffect, useState } from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clearToken, getCurrentUser, type AuthUser } from "@/lib/api";

export function AppNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((result) => {
        if (isMounted) {
          setUser(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          clearToken();
          navigate("/login", { replace: true });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const initials = user?.email.slice(0, 2).toUpperCase() ?? "DX";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger />
      <div className="relative hidden flex-1 md:block max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-9 h-9 bg-muted/50 border-0" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium leading-none">{user?.email ?? "Loading..."}</p>
          <p className="mt-1 text-xs text-muted-foreground">GitHub connected</p>
        </div>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            clearToken();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
