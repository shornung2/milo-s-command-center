import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/tasks": "Tasks",
  "/sessions": "Sessions",
  "/notes": "Notes",
  "/agents": "Agents",
  "/cron": "Cron Jobs",
  "/search": "Search",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const title = routeTitles[pathname] ?? "Milo";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
