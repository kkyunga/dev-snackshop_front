import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchLogAnalyzeRecent = async (serverId) => {
  const response = await api.get(`/api/log/analyze/${serverId}/recent`);
  return response.data;
};

export const useServerLogAnalyzeRecent = (serverId) => {
  return useQuery({
    queryKey: ["server-log-analyze-recent", serverId],
    queryFn: () => fetchLogAnalyzeRecent(serverId),
    enabled: !!serverId,
    staleTime: 30000,
  });
};
