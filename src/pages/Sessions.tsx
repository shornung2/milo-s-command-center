import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Send, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const Sessions = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sessions list
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.getSessions(),
    refetchInterval: 5000,
  });

  const sessions = useMemo(() => {
    const list = (sessionsData as any)?.sessions || (sessionsData as any)?.data || [];
    if (!Array.isArray(list)) return [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((s: any) =>
      (s.name || s.key || s.id || "").toLowerCase().includes(q)
    );
  }, [sessionsData, search]);

  const selectedSession = useMemo(
    () => sessions.find((s: any) => (s.id || s.key) === selectedId),
    [sessions, selectedId]
  );

  // History
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["sessionHistory", selectedId],
    queryFn: () => api.getSessionHistory(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 5000,
  });

  const messages = useMemo(() => {
    const list = (historyData as any)?.messages || (historyData as any)?.data || [];
    return Array.isArray(list) ? list : [];
  }, [historyData]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send
  const sendMutation = useMutation({
    mutationFn: (msg: string) => api.sendToSession(selectedId!, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessionHistory", selectedId] });
      setMessage("");
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || !selectedId) return;
    sendMutation.mutate(trimmed);
  };

  const selectSession = (id: string) => {
    setSelectedId(id);
    setShowChat(true);
  };

  // --- Session List Panel ---
  const sessionList = (
    <div className="w-full md:w-[300px] border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {sessionsLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No sessions found</p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((s: any) => {
              const id = s.id || s.key;
              const name = s.name || s.key || id;
              const isActive = s.status === "active";
              const unread = s.unreadCount || s.unread || 0;
              const isSelected = id === selectedId;
              return (
                <button
                  key={id}
                  onClick={() => selectSession(id)}
                  className={`w-full text-left rounded-md p-3 mb-1 transition-colors ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {unread > 0 && (
                        <Badge className="h-5 min-w-[20px] flex items-center justify-center text-[10px]">
                          {unread}
                        </Badge>
                      )}
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={isActive ? "bg-green-600 hover:bg-green-600 text-white" : ""}
                      >
                        {isActive ? "active" : "ended"}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // --- Chat Panel ---
  const chatPanel = (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {!selectedId ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p>Select a session to view messages</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowChat(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold truncate">
              {selectedSession?.name || selectedSession?.key || selectedId}
            </span>
            <Badge
              variant={selectedSession?.status === "active" ? "default" : "secondary"}
              className={selectedSession?.status === "active" ? "bg-green-600 hover:bg-green-600 text-white" : ""}
            >
              {selectedSession?.status || "unknown"}
            </Badge>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {historyLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <Skeleton className="h-16 w-2/3 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m: any, i: number) => {
                  const isUser = m.role === "user";
                  const ts = m.timestamp || m.createdAt || m.created_at;
                  return (
                    <div key={m.id || i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{m.content || m.text || m.message}</p>
                        {ts && (
                          <p className={`text-[10px] mt-1 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {format(new Date(ts), "MMM d, h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={sendMutation.isPending}
            />
            <Button onClick={handleSend} disabled={sendMutation.isPending || !message.trim()}>
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-border bg-background">
      {/* Mobile: toggle between list and chat */}
      <div className={`${showChat ? "hidden" : "flex"} md:flex w-full md:w-auto`}>
        {sessionList}
      </div>
      <div className={`${showChat ? "flex" : "hidden"} md:flex flex-1`}>
        {chatPanel}
      </div>
    </div>
  );
};

export default Sessions;
