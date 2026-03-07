import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchFiles = (serverId, path) =>
  api.get(`/api/ssh/files/${serverId}?path=${encodeURIComponent(path)}`).then((r) => r.data);

export const useServerFiles = (serverId, path) =>
  useQuery({
    queryKey: ["server-files", serverId, path],
    queryFn: () => fetchFiles(serverId, path),
    enabled: !!serverId,
    staleTime: 60000,
  });
