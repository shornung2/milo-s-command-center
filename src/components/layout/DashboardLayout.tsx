import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/tasks": "Tasks",
  "/sessions": "Sessions",
  "/notes": "Notes",
  "/agents": "Agents",
  "/cron": "Cron Jobs",
  "/search": "Search",
};

const statusConfig = {
  connected: { dot: "bg-emerald-500", label: "Connected" },
  disconnected: { dot: "bg-red-500", label: "Disconnected" },
  checking: { dot: "bg-amber-500 animate-pulse", label: "Checking..." },
} as const;

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const title = routeTitles[pathname] ?? "Milo";
  const { status } = useConnectionStatus();
  const cfg = statusConfig[status];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
              <span>{cfg.label}</span>
            </div>
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
