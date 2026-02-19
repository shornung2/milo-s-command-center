import {
  Home,
  CheckSquare,
  MessageSquare,
  StickyNote,
  Bot,
  Clock,
  Search,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Sessions", url: "/sessions", icon: MessageSquare },
  { title: "Notes", url: "/notes", icon: StickyNote },
  { title: "Agents", url: "/agents", icon: Bot },
  { title: "Cron Jobs", url: "/cron", icon: Clock },
  { title: "Search", url: "/search", icon: Search },
];

const sidebarStatusConfig = {
  connected: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400", label: "Online" },
  disconnected: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-400", label: "Offline" },
  checking: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400 animate-pulse", label: "Checking" },
} as const;

export function AppSidebar() {
  const { status } = useConnectionStatus();
  const sc = sidebarStatusConfig[status];

  return (
    <Sidebar className="border-r-0">
      <div className="flex items-center gap-3 px-4 py-5">
        <span className="text-xl font-bold tracking-wider text-sidebar-accent-foreground">
          MILO
        </span>
        <Badge className={cn(sc.bg, sc.text, sc.border, "text-[10px] px-1.5 py-0")}>
          <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", sc.dot)} />
          {sc.label}
        </Badge>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="!bg-sidebar-primary/15 !text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <button className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/50 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
