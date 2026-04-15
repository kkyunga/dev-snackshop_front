import api from "./axios";

export const simpleMiddlewareList = async () => {
    const response = await api.get("/api/middleware/simple/list");
    return response.data;
};
