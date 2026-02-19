import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ConnectionStatus = "connected" | "disconnected" | "checking";

export function useConnectionStatus() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["connection-status"],
    queryFn: async () => {
      const res = await api.getDashboard();
      if (!res.ok) throw new Error((res as { error: string }).error);
      return true;
    },
    refetchInterval: 10_000,
    retry: 1,
    staleTime: 8_000,
  });

  const status: ConnectionStatus = isLoading
    ? "checking"
    : isError || !data
      ? "disconnected"
      : "connected";

  return { status };
}
