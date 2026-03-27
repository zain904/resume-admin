"use client";

import { useEffect, useState } from "react";

interface TopbarProps {
    onMenuClick: () => void;
    title: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
    const [isDark, setIsDark] = useState(false);
    const [adminName, setAdminName] = useState("Admin");

    useEffect(() => {
        const theme = localStorage.getItem("theme") || "light";
        setIsDark(theme === "dark");
        document.documentElement.setAttribute("data-theme", theme);
        setAdminName(localStorage.getItem("admin_full_name") || "Admin");
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? "light" : "dark";
        setIsDark(!isDark);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <header
            className="sticky top-0 z-10 flex items-center justify-between px-4 lg:px-6 h-16"
            style={{
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
            }}
        >
            {/* Left */}
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    {title}
                </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

                {/* Dark mode toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                        background: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)"
                    }}
                >
                    {isDark ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white text-xs font-bold">
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {adminName}
                    </span>
                </div>
            </div>
        </header>
    );
}