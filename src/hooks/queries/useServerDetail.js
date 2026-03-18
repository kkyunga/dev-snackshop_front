import { useQuery } from "@tanstack/react-query";
import { fetchServerDetail } from "@/api/serverDetail";

export const useServerDetail = (id, options = {}) => {
  return useQuery({
    queryKey: ["server", id],
    queryFn: () => fetchServerDetail(id),
    select: (res) => res.data,
    enabled: !!id,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    ...options,
  });
};
