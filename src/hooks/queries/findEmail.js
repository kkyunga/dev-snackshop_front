import { findEmailApi } from "@/api/findEmail";
import { useMutation } from "@tanstack/react-query";
export const useFindEmail = (setFoundEmail, setError) => {
  return useMutation({
    mutationFn: findEmailApi,
    onSuccess: (data) => {
      setFoundEmail(data.data.email);
    },
    onError: (err) => {
      debugger;
      const serverMessage = err.response?.data?.message;
      const message = serverMessage || "이메일을 찾을수 없습니다";
      setError(message);
    },
  });
};
