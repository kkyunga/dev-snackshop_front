import api from "./axios";

export const userMiddlewareList = async (userOsId) => {
    const response = await api.get("/api/middleware/user-os/list", { params: { userOsId } });
    return response.data;
};
