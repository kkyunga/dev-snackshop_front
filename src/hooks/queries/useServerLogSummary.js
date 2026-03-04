import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchLogSummary = async (serverId) => {
  const response = await api.get(`/api/servers/summary/${serverId}`);
  return response.data;
};

export const useServerLogSummary = (serverId) => {
  return useQuery({
    queryKey: ["server-log-summary", serverId],
    queryFn: () => fetchLogSummary(serverId),
    enabled: !!serverId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
};
