import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchLogAnalyze = async (serverId) => {
  const response = await api.get(`/api/log/analyze/${serverId}`);
  return response.data;
};

export const useServerLogAnalyze = (serverId) => {
  return useQuery({
    queryKey: ["server-log-analyze", serverId],
    queryFn: () => fetchLogAnalyze(serverId),
    enabled: !!serverId,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
};
