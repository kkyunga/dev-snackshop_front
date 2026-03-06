import api from "./axios";

export const serverUpdate = async ({ keyFile, ...serverData }) => {
    const formData = new FormData();
    formData.append(
        "request",
        new Blob([JSON.stringify(serverData)], { type: "application/json" }),
    );
    if (keyFile) {
        formData.append("keyFile", keyFile);
    }
    const response = await api.post("/api/servers/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};
