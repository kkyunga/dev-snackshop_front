import api from "./axios";

export const fetchServerMetrics = async (id) => {
  const response = await api.get(`/api/servers/${id}/metrics`);
  return response.data;
};
