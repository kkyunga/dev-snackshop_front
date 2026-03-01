import api from "./axios";

export const middlewareAdd = async (userOsInstanceId, installPath, mwVersion, middlewares) => {
    const requestData = {
        userOsInstanceId,
        installPath,
        mwVersion,
        middlewares,
    };

    const response = await api.post("/api/middleware/install", requestData, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};