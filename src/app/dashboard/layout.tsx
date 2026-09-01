"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard Overview",
    "/dashboard/users": "Users Management",
    "/dashboard/profiles": "Profiles",
    "/dashboard/subscriptions": "Subscriptions",
    "/dashboard/notifications": "Notifications",
    "/dashboard/resumes": "Resumes",
    "/dashboard/templates": "Templates",
    "/dashboard/onboarding": "Onboarding Funnel",
    "/dashboard/trial-activation": "Trial Activation",
    "/dashboard/settings": "Settings",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) { router.push("/"); return; }

        const theme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", theme);

        const saved = localStorage.getItem("sidebar_collapsed");
        setIsCollapsed(saved === "true");
        setMounted(true);
    }, []);

    const handleToggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem("sidebar_collapsed", String(next));
    };

    if (!mounted) return null;

    const title =
        Object.entries(pageTitles).find(([key]) =>
            pathname === key || (key !== "/dashboard" && pathname.startsWith(key))
        )?.[1] || "Dashboard";

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "var(--bg-secondary)" }}
        >
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={isCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                <Topbar
                    onMenuClick={() => setSidebarOpen(true)}
                    title={title}
                />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}