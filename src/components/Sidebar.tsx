"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { clearAuthData } from "@/app/page";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: "Users",
        href: "/dashboard/users",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        label: "Profiles",
        href: "/dashboard/profiles",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        label: "Resumes",
        href: "/dashboard/resumes",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: "Subscriptions",
        href: "/dashboard/subscriptions",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
    },
    {
        label: "Templates",
        href: "/dashboard/templates",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({
    isOpen,
    onClose,
    isCollapsed,
    onToggleCollapse,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [adminName, setAdminName] = useState("Admin");
    const [adminRole, setAdminRole] = useState("SUPER_ADMIN");
    const [adminEmail, setAdminEmail] = useState("");

    useEffect(() => {
        setAdminName(localStorage.getItem("admin_full_name") || "Admin");
        setAdminRole(localStorage.getItem("admin_role") || "SUPER_ADMIN");
        setAdminEmail(localStorage.getItem("admin_email") || "");
    }, []);

    const handleLogout = () => {
        clearAuthData();
        router.push("/");
    };

    const sidebarWidth = isCollapsed ? "72px" : "260px";

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside
                className={`
          fixed top-0 left-0 z-30 h-full flex flex-col
          transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
                style={{
                    width: sidebarWidth,
                    minWidth: sidebarWidth,
                    background: "var(--bg-sidebar)",
                    borderRight: "1px solid var(--border)",
                }}
            >

                {/* ── LOGO ── */}
                <div
                    className="flex items-center h-16 px-4 shrink-0 relative"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    {/* Logo icon */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center shadow-lg shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>

                    {/* Brand text */}
                    {!isCollapsed && (
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-bold truncate"
                                style={{ color: "var(--text-primary)" }}>
                                Resume Admin
                            </p>
                            <p className="text-xs truncate"
                                style={{ color: "var(--text-muted)" }}>
                                Control Panel
                            </p>
                        </div>
                    )}

                    {/* Collapse toggle — desktop only */}
                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full items-center justify-center transition-all duration-200 hover:scale-110 z-10"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                            boxShadow: "var(--shadow-md)",
                        }}
                    >
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* ── NAV ── */}
                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
                    {/* Section label */}
                    {!isCollapsed && (
                        <p className="text-xs font-bold uppercase tracking-widest px-3 pb-2 pt-1"
                            style={{ color: "var(--text-muted)" }}>
                            Main Menu
                        </p>
                    )}

                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);

                        return (
                            <div key={item.href} className="relative group">
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                    flex items-center gap-3 rounded-xl text-sm font-medium
                    transition-all duration-150 relative
                    ${isCollapsed ? "justify-center px-0 py-3 mx-1" : "px-3 py-2.5"}
                  `}
                                    style={{
                                        background: isActive
                                            ? "linear-gradient(135deg, #0ea5e920, #7c3aed15)"
                                            : "transparent",
                                        color: isActive ? "var(--accent)" : "var(--text-secondary)",
                                        border: isActive ? "1px solid var(--accent)20" : "1px solid transparent",
                                    }}
                                >
                                    {/* active left bar */}
                                    {isActive && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-[#0ea5e9] to-[#7c3aed]" />
                                    )}

                                    {/* icon */}
                                    <span
                                        className={`shrink-0 transition-all duration-150 ${isCollapsed ? "" : "ml-1"}`}
                                        style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
                                    >
                                        {item.icon}
                                    </span>

                                    {/* label */}
                                    {!isCollapsed && (
                                        <span className="flex-1 truncate">{item.label}</span>
                                    )}

                                    {/* active dot */}
                                    {isActive && !isCollapsed && (
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                            style={{ background: "var(--accent)" }} />
                                    )}
                                </Link>

                                {/* Tooltip when collapsed */}
                                {isCollapsed && (
                                    <div
                                        className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap
                      opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50"
                                        style={{
                                            background: "var(--text-primary)",
                                            color: "var(--bg-primary)",
                                            boxShadow: "var(--shadow-md)",
                                        }}
                                    >
                                        {item.label}
                                        {/* arrow */}
                                        <div
                                            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                                            style={{ borderRightColor: "var(--text-primary)" }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* ── BOTTOM ── */}
                <div className="shrink-0 p-2" style={{ borderTop: "1px solid var(--border)" }}>

                    {/* Admin info card */}
                    {!isCollapsed && (
                        <div
                            className="flex items-center gap-2.5 p-3 rounded-xl mb-2"
                            style={{ background: "var(--bg-secondary)" }}
                        >
                            {/* avatar */}
                            <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold">
                                    {adminName.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                                    style={{ borderColor: "var(--bg-secondary)" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                                    {adminName}
                                </p>
                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                    {adminEmail || adminRole}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Collapsed avatar */}
                    {isCollapsed && (
                        <div className="flex justify-center mb-2">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold">
                                    {adminName.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                                    style={{ borderColor: "var(--bg-sidebar)" }} />
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className={`
              w-full flex items-center gap-3 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
            `}
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <svg
                            className="w-5 h-5 text-red-400 shrink-0 group-hover:text-red-500 transition-colors"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!isCollapsed && (
                            <span className="text-red-400 group-hover:text-red-500 transition-colors">
                                Sign Out
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}