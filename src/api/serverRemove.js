import api from "./axios";

export const serverRemove = async (userOsId) => {
    const response = await api.post("/api/servers/delete", {
        userOsId: userOsId
    });
    return response.data;
};