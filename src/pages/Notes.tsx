import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Search, Plus, Pin, Trash2, ArrowLeft, FileText, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
  updated_at?: string;
  created_at?: string;
}

const Notes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Editor local state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const dirtyRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch notes
  const { data: notesRes, isLoading } = useQuery({
    queryKey: ["notes", debouncedSearch],
    queryFn: () => api.getNotes(debouncedSearch || undefined),
  });

  const notes: Note[] = (notesRes as any)?.notes || (notesRes as any)?.data || [];

  // Sort: pinned first, then by updated_at desc
  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
  });

  const selectedNote = notes.find((n) => n.id === selectedId);

  // Sync editor state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      initialLoadRef.current = true;
      setEditTitle(selectedNote.title || "");
      setEditContent(selectedNote.content || "");
      setEditTags(selectedNote.tags || []);
      // Allow a tick for state to settle before marking not-initial
      setTimeout(() => {
        initialLoadRef.current = false;
        dirtyRef.current = false;
      }, 50);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save debounce
  useEffect(() => {
    if (initialLoadRef.current || !selectedId) return;
    dirtyRef.current = true;
    const t = setTimeout(() => {
      if (dirtyRef.current) {
        updateMutation.mutate({
          noteId: selectedId,
          updates: { title: editTitle, content: editContent, tags: editTags },
        });
        dirtyRef.current = false;
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [editTitle, editContent, editTags]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => api.createNote({ title: "Untitled Note", content: "" }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      const newId = res?.note?.id || res?.id;
      if (newId) {
        setSelectedId(newId);
        setShowEditor(true);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, updates }: { noteId: string; updates: any }) =>
      api.updateNote(noteId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => api.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedId(null);
      setShowEditor(false);
    },
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowEditor(true);
  };

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !editTags.includes(tag)) {
      setEditTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }, [tagInput, editTags]);

  const handleRemoveTag = (tag: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTogglePin = (note: Note) => {
    updateMutation.mutate({
      noteId: note.id,
      updates: { pinned: !note.pinned } as any,
    });
  };

  // ── Note List ──
  const noteList = (
    <div className="flex h-full w-full flex-col md:w-[300px] md:min-w-[300px] md:border-r border-border">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1 hidden sm:inline">New</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <FileText className="h-10 w-10" />
            <p>No notes yet</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sorted.map((note) => (
              <ContextMenu key={note.id}>
                <ContextMenuTrigger asChild>
                  <button
                    onClick={() => handleSelect(note.id)}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-accent ${
                      selectedId === note.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {note.pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                      <span className="truncate text-sm font-medium">{note.title || "Untitled"}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {note.content?.slice(0, 60) || "No content"}
                    </p>
                    {note.updated_at && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                      </p>
                    )}
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleTogglePin(note)}>
                    <Pin className="mr-2 h-4 w-4" />
                    {note.pinned ? "Unpin" : "Pin"}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(note.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // ── Editor ──
  const editor = selectedNote ? (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowEditor(false)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="flex-1 border-none text-lg font-semibold shadow-none focus-visible:ring-0"
          placeholder="Note title"
        />
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => deleteMutation.mutate(selectedNote.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Start writing…"
          className="min-h-[300px] w-full resize-none border-none font-mono text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {editTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add tag…"
            className="h-7 w-24 text-xs"
          />
        </div>
        {updateMutation.isPending && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
      <div className="text-center">
        <FileText className="mx-auto h-12 w-12 mb-2" />
        <p>Select a note or create a new one</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className={`${showEditor ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        {noteList}
      </div>
      <div className={`${showEditor ? "flex" : "hidden md:flex"} flex-1`}>
        {editor}
      </div>
    </div>
  );
};

export default Notes;
