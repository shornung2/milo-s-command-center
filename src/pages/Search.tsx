import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, CheckSquare, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

const SOURCE_CONFIG = {
  notes: { label: "Notes", icon: FileText, badge: "default" as const, path: "/notes" },
  tasks: { label: "Tasks", icon: CheckSquare, badge: "secondary" as const, path: "/tasks" },
  sessions: { label: "Sessions", icon: MessageSquare, badge: "outline" as const, path: "/sessions" },
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sources, setSources] = useState<Record<string, boolean>>({
    notes: true,
    tasks: true,
    sessions: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const selectedSources = useMemo(
    () => Object.entries(sources).filter(([, v]) => v).map(([k]) => k),
    [sources]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery, selectedSources],
    queryFn: () => api.search(debouncedQuery, selectedSources, 50),
    enabled: debouncedQuery.length > 0 && selectedSources.length > 0,
  });

  const results: any[] = data?.ok ? (data as any).results ?? [] : [];

  const toggleSource = (source: string) => {
    setSources((prev) => {
      const next = { ...prev, [source]: !prev[source] };
      if (Object.values(next).every((v) => !v)) return prev;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>

      {/* Search input */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, tasks, sessions..."
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Source filters */}
      <div className="flex items-center gap-4">
        {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox
              id={`src-${key}`}
              checked={sources[key]}
              onCheckedChange={() => toggleSource(key)}
            />
            <Label htmlFor={`src-${key}`} className="flex items-center gap-1 cursor-pointer">
              <cfg.icon className="h-3.5 w-3.5" />
              {cfg.label}
            </Label>
          </div>
        ))}
      </div>

      {/* Results */}
      {!debouncedQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Search className="h-10 w-10" />
          <p>Start typing to search</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 max-w-2xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground py-8">No results for "{debouncedQuery}"</p>
      ) : (
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm text-muted-foreground mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{debouncedQuery}"
          </p>
          {results.map((r: any, i: number) => {
            const cfg = SOURCE_CONFIG[r.source as keyof typeof SOURCE_CONFIG];
            return (
              <Card
                key={r.id ?? i}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => cfg && navigate(cfg.path)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {cfg && <Badge variant={cfg.badge}>{cfg.label}</Badge>}
                      <span className="font-medium truncate">{r.title}</span>
                    </div>
                    {r.snippet && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{r.snippet}</p>
                    )}
                  </div>
                  {r.score != null && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {Math.round(r.score * 100)}%
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
