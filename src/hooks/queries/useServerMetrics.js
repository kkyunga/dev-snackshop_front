import { useQuery } from "@tanstack/react-query";
import { fetchServerMetrics } from "@/api/serverMetrics";

export const useServerMetrics = (id) => {
  return useQuery({
    queryKey: ["serverMetrics", id],
    queryFn: () => fetchServerMetrics(id),
    select: (res) => res.data,
    enabled: !!id,
    refetchInterval: 10000, // 10초마다 자동 갱신
    refetchIntervalInBackground: false, // 탭 비활성 시 중단
  });
};
