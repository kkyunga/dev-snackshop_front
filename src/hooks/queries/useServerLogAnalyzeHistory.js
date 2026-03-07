import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchLogAnalyzeHistory = async (serverId, minutes = 60) => {
  const response = await api.get(`/api/log/analyze/${serverId}/history?minutes=${minutes}`);
  return response.data;
};

export const useServerLogAnalyzeHistory = (serverId, minutes = 60, enabled = true) => {
  return useQuery({
    queryKey: ["server-log-analyze-history", serverId, minutes],
    queryFn: () => fetchLogAnalyzeHistory(serverId, minutes),
    enabled: !!serverId && enabled,
    staleTime: 30000,
  });
};
