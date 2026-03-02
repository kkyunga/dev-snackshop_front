import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchCpuMetrics = async () => {
  const response = await api.get(`/api/metrics/server/latest`, {
    params: { serverId: 103 },
  });
  const list = response.data ?? [];
  return list.map((item) => ({
    x: new Date(item.timestamp).getTime(),
    cpuUsage: item.cpuUsage ?? 0,
    cpuCores: item.cpuCores ?? null,
    cpuThreads: item.cpuThreads ?? null,
    memoryUsed: item.memoryUsed ?? 0,
    memoryTotal: item.memoryTotal ?? 0,
    memoryPercentage: item.memoryPercentage ?? 0,
    diskUsed: item.diskUsed ?? "-",
    diskTotal: item.diskTotal ?? "-",
    diskUsedGb: item.diskUsedGb ?? 0,
    diskTotalGb: item.diskTotalGb ?? 0,
    diskPercentage: item.diskPercentage ?? 0,
    networkRxKb: item.networkRxKb ?? null,
    networkTxKb: item.networkTxKb ?? null,
  }));
};

export const useServerMetricsEs = () => {
  return useQuery({
    queryKey: ["server-metrics-es", 103],
    queryFn: fetchCpuMetrics,
    enabled: true,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
};
