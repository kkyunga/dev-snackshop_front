import api from "./axios";
export const findEmailApi = async (data) => {
  const response = await api.post("/api/auth/findEmail", data);
  return response.data;
};
