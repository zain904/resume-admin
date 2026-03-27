export const getAdminData = () => {
    if (typeof window === "undefined") return null;
    return {
        id: localStorage.getItem("admin_id") || "",
        email: localStorage.getItem("admin_email") || "",
        full_name: localStorage.getItem("admin_full_name") || "",
        avatar_url: localStorage.getItem("admin_avatar_url") || "",
        role: localStorage.getItem("admin_role") || "",
        token: localStorage.getItem("admin_token") || "",
    };
};

export const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("admin_token");
};