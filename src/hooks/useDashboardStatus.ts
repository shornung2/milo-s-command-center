import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardStatus {
  status: string;
  kanban: Record<string, unknown>;
  tasks: Record<string, unknown>[];
  notes: Record<string, unknown>[];
  activity: Record<string, unknown>[];
}

export function useDashboardStatus() {
  const { data, isLoading, error, refetch } = useQuery<DashboardStatus>({
    queryKey: ['dashboard-status'],
    queryFn: async () => {
      const res = await api.getDashboard();
      if (!res.ok) throw new Error((res as { ok: false; error: string }).error);
      const { ok, ...rest } = res;
      return rest as unknown as DashboardStatus;
    },
    refetchInterval: 5000,
    staleTime: 4000,
    retry: 3,
  });

  return {
    loading: isLoading,
    error: error?.message ?? null,
    status: data?.status ?? null,
    kanban: data?.kanban ?? null,
    tasks: data?.tasks ?? null,
    notes: data?.notes ?? null,
    activity: data?.activity ?? null,
    refetch,
  };
}
