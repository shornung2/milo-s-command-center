import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { Plus, Play, Pencil, Trash2, History, Loader2, Clock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { api, CronJobData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';

const SCHEDULE_HELP: Record<string, string> = {
  cron: 'e.g. */5 * * * * (every 5 minutes)',
  at: 'e.g. 2025-03-01T09:00:00Z (ISO date)',
  every: 'e.g. 30m, 2h, 1d',
};

const defaultForm: CronJobData = {
  name: '',
  scheduleType: 'cron',
  expression: '',
  payloadType: 'agentTurn',
  payload: '',
  enabled: true,
};

const CronJobs = () => {
  const qc = useQueryClient();

  // Modal state
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [form, setForm] = useState<CronJobData>({ ...defaultForm });

  const [runsModalOpen, setRunsModalOpen] = useState(false);
  const [viewingRunsJobId, setViewingRunsJobId] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  // Reset form when modal opens/closes or editing job changes
  useEffect(() => {
    if (jobModalOpen && editingJob) {
      setForm({
        name: editingJob.name || '',
        scheduleType: editingJob.scheduleType || 'cron',
        expression: editingJob.expression || '',
        payloadType: editingJob.payloadType || 'agentTurn',
        payload: editingJob.payload || '',
        enabled: editingJob.enabled ?? true,
      });
    } else if (jobModalOpen && !editingJob) {
      setForm({ ...defaultForm });
    }
  }, [jobModalOpen, editingJob]);

  // Queries
  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['cronJobs'],
    queryFn: () => api.getCronJobs(),
    refetchInterval: 10000,
  });

  const { data: runsRes, isLoading: runsLoading } = useQuery({
    queryKey: ['cronRuns', viewingRunsJobId],
    queryFn: () => api.getCronRuns(viewingRunsJobId!),
    enabled: !!viewingRunsJobId,
  });

  const jobs: any[] = (jobsRes as any)?.ok ? ((jobsRes as any).jobs || []) : [];
  const runs: any[] = (runsRes as any)?.ok ? ((runsRes as any).runs || []) : [];

  // Mutations
  const createMut = useMutation({
    mutationFn: (data: CronJobData) => api.createCronJob(data),
    onSuccess: (res) => {
      if ((res as any).ok) {
        toast.success('Cron job created');
        qc.invalidateQueries({ queryKey: ['cronJobs'] });
        setJobModalOpen(false);
      } else {
        toast.error((res as any).error || 'Failed to create job');
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CronJobData> }) =>
      api.updateCronJob(id, data),
    onSuccess: (res) => {
      if ((res as any).ok) {
        toast.success('Cron job updated');
        qc.invalidateQueries({ queryKey: ['cronJobs'] });
        setJobModalOpen(false);
      } else {
        toast.error((res as any).error || 'Failed to update job');
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteCronJob(id),
    onSuccess: (res) => {
      if ((res as any).ok) {
        toast.success('Cron job deleted');
        qc.invalidateQueries({ queryKey: ['cronJobs'] });
      } else {
        toast.error((res as any).error || 'Failed to delete job');
      }
    },
  });

  const runMut = useMutation({
    mutationFn: (id: string) => api.runCronJob(id),
    onSuccess: (res) => {
      if ((res as any).ok) {
        toast.success('Job triggered successfully');
      } else {
        toast.error((res as any).error || 'Failed to run job');
      }
    },
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.expression.trim()) {
      toast.error('Name and expression are required');
      return;
    }
    if (editingJob) {
      updateMut.mutate({ id: editingJob.id, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const openEdit = (job: any) => {
    setEditingJob(job);
    setJobModalOpen(true);
  };

  const openCreate = () => {
    setEditingJob(null);
    setJobModalOpen(true);
  };

  const openRuns = (jobId: string) => {
    setViewingRunsJobId(jobId);
    setExpandedRunId(null);
    setRunsModalOpen(true);
  };

  const formatTs = (ts: string | undefined) => {
    if (!ts) return '—';
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true });
    } catch {
      return ts;
    }
  };

  const computeDuration = (start?: string, end?: string) => {
    if (!start || !end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <p className="text-sm text-muted-foreground">Manage scheduled tasks and automation</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Jobs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  No cron jobs configured
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="mr-1">{job.scheduleType}</Badge>
                    <code className="text-xs">{job.expression}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.enabled ? 'default' : 'secondary'}>
                      {job.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatTs(job.nextRun)}</TableCell>
                  <TableCell className="text-sm">{formatTs(job.lastRun)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => runMut.mutate(job.id)}
                        disabled={runMut.isPending}
                        title="Run Now"
                      >
                        {runMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(job)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{job.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this cron job. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMut.mutate(job.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button variant="ghost" size="icon" onClick={() => openRuns(job.id)} title="View Runs">
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Job Modal */}
      <Dialog open={jobModalOpen} onOpenChange={(open) => { if (!open) setJobModalOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'New Cron Job'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Daily report"
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule Type</Label>
              <Select
                value={form.scheduleType}
                onValueChange={(v) => setForm({ ...form, scheduleType: v as any })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cron">Cron</SelectItem>
                  <SelectItem value="at">At (one-time)</SelectItem>
                  <SelectItem value="every">Every (interval)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expression</Label>
              <Input
                value={form.expression}
                onChange={(e) => setForm({ ...form, expression: e.target.value })}
                placeholder={form.scheduleType === 'cron' ? '*/5 * * * *' : form.scheduleType === 'at' ? '2025-03-01T09:00:00Z' : '30m'}
              />
              <p className="text-xs text-muted-foreground">{SCHEDULE_HELP[form.scheduleType]}</p>
            </div>
            <div className="space-y-2">
              <Label>Payload Type</Label>
              <Select
                value={form.payloadType}
                onValueChange={(v) => setForm({ ...form, payloadType: v as any })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agentTurn">Agent Turn</SelectItem>
                  <SelectItem value="systemEvent">System Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payload</Label>
              <Textarea
                value={form.payload}
                onChange={(e) => setForm({ ...form, payload: e.target.value })}
                placeholder="Message or task text..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enabled"
                checked={form.enabled}
                onCheckedChange={(checked) => setForm({ ...form, enabled: !!checked })}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingJob ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Runs Modal */}
      <Dialog open={runsModalOpen} onOpenChange={(open) => { if (!open) { setRunsModalOpen(false); setViewingRunsJobId(null); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Run History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {runsLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : runs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No runs recorded yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Execution ID</TableHead>
                    <TableHead>Triggered At</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.slice(0, 20).map((run) => (
                    <Collapsible key={run.id} asChild open={expandedRunId === run.id} onOpenChange={(open) => setExpandedRunId(open ? run.id : null)}>
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-mono text-xs">{run.id?.slice(0, 8) || '—'}</TableCell>
                            <TableCell className="text-sm">
                              {run.triggeredAt ? format(new Date(run.triggeredAt), 'MMM d, HH:mm:ss') : '—'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {run.completedAt ? format(new Date(run.completedAt), 'MMM d, HH:mm:ss') : '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={run.status === 'success' ? 'default' : run.status === 'running' ? 'secondary' : 'destructive'}>
                                {run.status || 'unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {run.duration || computeDuration(run.triggeredAt, run.completedAt)}
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={5} className="bg-muted/30 p-4">
                              <pre className="text-xs whitespace-pre-wrap font-mono max-h-40 overflow-auto">
                                {run.output || JSON.stringify(run, null, 2)}
                              </pre>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CronJobs;
