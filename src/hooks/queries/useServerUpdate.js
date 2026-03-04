import { serverUpdate } from "@/api/serverUpdate.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useServerUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: serverUpdate,
        onSuccess: (res) => {
            alert(res.data || res.message || "서버 정보가 업데이트되었습니다.");
            queryClient.invalidateQueries({ queryKey: ["servers"] });
        },
        onError: (err) => {
            const msg = err.response?.data?.message || "서버 수정에 실패했습니다.";
            alert(msg);
        },
    });
};
