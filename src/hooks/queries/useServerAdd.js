import { serverAdd } from "@/api/serverAdd";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useServerAdd = (setShowAddForm, setNewServer) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serverAdd,
    onSuccess: (res) => {
      alert(res.data || res.message || "서버가 추가되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      setShowAddForm(false);
      setNewServer({
        label: "",
        ip: "",
        port: "",
        osType: "Linux",
        osVersion: "",
        country: "",
        cloudService: "",
        purpose: "",
        authType: "password",
        username: "",
        password: "",
        keyFile: null,
        softwareToInstall: [
          // { name: "java", path: "/usr/lib/jvm" },
          // { name: "apache", path: "/usr/local/apache2" },
        ],
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "서버 추가에 실패했습니다.";
      alert(msg);
    },
  });
};
