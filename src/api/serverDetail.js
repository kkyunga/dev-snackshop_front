import api from "./axios";

export const fetchServerDetail = async (id) => {
  const response = await api.get(`/api/servers/${id}`);
  return response.data;
};
