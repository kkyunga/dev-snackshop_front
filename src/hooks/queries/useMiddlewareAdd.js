import { useMutation, useQueryClient } from "@tanstack/react-query";
import { middlewareAdd } from "@/api/middlewareAdd";

export const useMiddlewareAdd = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userOsInstanceId, installPath, mwVersion, middlewares }) =>
            middlewareAdd(userOsInstanceId, installPath, mwVersion, middlewares),

        onSuccess: (data) => {
            queryClient.invalidateQueries(["middlewares"]);
            console.log("미들웨어 설치 결과:", data);
        },

        onError: (error) => {
            console.error("미들웨어 설치 실패:", error);
        },
    });
};