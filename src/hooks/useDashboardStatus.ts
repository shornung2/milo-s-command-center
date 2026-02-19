import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardData {
  status: {
    gateway: string;
    uptime_seconds: number;
    cpu: string;
    mem: string;
  };
  kanban: {
    columns: Record<string, unknown[]>;
  };
  tasks: {
    total: number;
    by_column: Record<string, unknown>;
  };
  notes: {
    total: number;
    pinned: number;
  };
  activity: Array<{
    ts: string;
    level: string;
    summary: string;
    details: string | null;
    source: string;
  }>;
}

export function useDashboardStatus() {
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard-status'],
    queryFn: async () => {
      const res = await api.getDashboard();
      if (!res.ok) throw new Error((res as { ok: false; error: string }).error);
      const { ok, ...rest } = res;
      return rest as unknown as DashboardData;
    },
    refetchInterval: 5000,
    staleTime: 4000,
    retry: 3,
  });

  return {
    loading: isLoading,
    error: error?.message ?? null,
    data: data ?? null,
    refetch,
  };
}
