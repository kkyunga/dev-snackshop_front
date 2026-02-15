import api from "./axios";

export const serverList = async () => {
    const response = await api.get("/api/servers/list");
    return response.data;
};