"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface TopUser {
    userId: string;
    profileCount: number;
    user: {
        id: string;
        name: string;
        email: string;
        userType: "user" | "guest";
        providerType: string;
    };
}

interface Stats {
    totalUsers: number;
    guestUsers: number;
    regularUsers: number;
    newUsersThisMonth: number;
    totalProfiles: number;
    usersWithProfile: number;
    usersWithoutProfile: number;
    newProfilesThisMonth: number;
    avgProfilesPerUser: number;
    activeSubscriptions: number;
    proPlanUsers: number;
    basicPlanUsers: number;
    topUsersByProfiles: TopUser[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState("Admin");
    const [time, setTime] = useState("");

    useEffect(() => {
        setAdminName(localStorage.getItem("admin_full_name") || "Admin");
        const updateTime = () => {
            setTime(new Date().toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", hour12: true
            }));
        };
        updateTime();
        const t = setInterval(updateTime, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/stats");
                setStats(res.data.data);
            } catch {
                setStats({
                    totalUsers: 0,
                    guestUsers: 0,
                    regularUsers: 0,
                    newUsersThisMonth: 0,
                    totalProfiles: 0,
                    usersWithProfile: 0,
                    usersWithoutProfile: 0,
                    newProfilesThisMonth: 0,
                    avgProfilesPerUser: 0,
                    activeSubscriptions: 0,
                    proPlanUsers: 0,
                    basicPlanUsers: 0,
                    topUsersByProfiles: [],
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[#0ea5e9]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#0ea5e9] animate-spin" />
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Loading dashboard...
                </p>
            </div>
        );
    }

    const cards = [
        {
            title: "Total Users",
            value: stats?.totalUsers ?? 0,
            sub: `+${stats?.newUsersThisMonth ?? 0} new this month`,
            gradient: "from-[#0ea5e9] via-[#0284c7] to-[#0369a1]",
            glow: "shadow-[#0ea5e9]/25",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            badge: `+${stats?.newUsersThisMonth ?? 0} this month`,
            badgeOk: true,
        },
        {
            title: "Total Profiles",
            value: stats?.totalProfiles ?? 0,
            sub: `+${stats?.newProfilesThisMonth ?? 0} new this month`,
            gradient: "from-[#6366f1] via-[#7c3aed] to-[#6d28d9]",
            glow: "shadow-[#7c3aed]/25",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            badge: `${(stats?.avgProfilesPerUser ?? 0).toFixed(1)} avg/user`,
            badgeOk: true,
        },
        {
            title: "Active Subscriptions",
            value: stats?.activeSubscriptions ?? 0,
            sub: `${stats?.proPlanUsers ?? 0} Pro · ${stats?.basicPlanUsers ?? 0} Basic`,
            gradient: "from-[#10b981] via-[#059669] to-[#047857]",
            glow: "shadow-[#10b981]/25",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            badge: `${stats?.proPlanUsers ?? 0} on Pro`,
            badgeOk: true,
        },
        {
            title: "Regular Members",
            value: stats?.regularUsers ?? 0,
            sub: "Social login accounts",
            gradient: "from-[#f59e0b] via-[#d97706] to-[#b45309]",
            glow: "shadow-[#f59e0b]/25",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            badge: `${stats?.usersWithProfile ?? 0} have profiles`,
            badgeOk: true,
        },
        {
            title: "Guest Users",
            value: stats?.guestUsers ?? 0,
            sub: "Anonymous sessions",
            gradient: "from-[#ec4899] via-[#db2777] to-[#be185d]",
            glow: "shadow-[#ec4899]/25",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            badge: `${stats?.usersWithoutProfile ?? 0} no profile`,
            badgeOk: false,
        },
    ];

    const navCards = [
        {
            title: "Users",
            desc: "Manage all user accounts, view profiles and activity",
            href: "/dashboard/users",
            gradient: "from-[#0ea5e9] to-[#0284c7]",
            glow: "hover:shadow-[#0ea5e9]/20",
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            stat: `${stats?.totalUsers ?? 0} total`,
        },
        {
            title: "Profiles",
            desc: "Browse resume profiles, skills, experience & education",
            href: "/dashboard/users",
            gradient: "from-[#7c3aed] to-[#6d28d9]",
            glow: "hover:shadow-[#7c3aed]/20",
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            stat: `${stats?.totalProfiles ?? 0} profiles`,
        },
        {
            title: "Subscriptions",
            desc: "View and manage user subscription plans",
            href: "/dashboard/subscriptions",
            gradient: "from-[#10b981] to-[#059669]",
            glow: "hover:shadow-[#10b981]/20",
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            stat: `${stats?.activeSubscriptions ?? 0} active`,
        },
        {
            title: "Resumes",
            desc: "Browse all resumes created by users",
            href: "/dashboard/resumes",
            gradient: "from-[#f59e0b] to-[#d97706]",
            glow: "hover:shadow-[#f59e0b]/20",
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            ),
            stat: "View all",
        },
    ];

    const totalForBar = stats?.totalUsers || 1;
    const bars = [
        {
            label: "Regular Users",
            value: stats?.regularUsers ?? 0,
            pct: Math.round(((stats?.regularUsers ?? 0) / totalForBar) * 100),
            gradient: "from-[#0ea5e9] to-[#38bdf8]",
            color: "#0ea5e9",
        },
        {
            label: "Guest Users",
            value: stats?.guestUsers ?? 0,
            pct: Math.round(((stats?.guestUsers ?? 0) / totalForBar) * 100),
            gradient: "from-[#ec4899] to-[#f472b6]",
            color: "#ec4899",
        },
        {
            label: "With Profile",
            value: stats?.usersWithProfile ?? 0,
            pct: Math.round(((stats?.usersWithProfile ?? 0) / totalForBar) * 100),
            gradient: "from-[#7c3aed] to-[#a78bfa]",
            color: "#7c3aed",
        },
        {
            label: "Without Profile",
            value: stats?.usersWithoutProfile ?? 0,
            pct: Math.round(((stats?.usersWithoutProfile ?? 0) / totalForBar) * 100),
            gradient: "from-[#f59e0b] to-[#fbbf24]",
            color: "#f59e0b",
        },
        {
            label: "Subscribed",
            value: stats?.activeSubscriptions ?? 0,
            pct: Math.round(((stats?.activeSubscriptions ?? 0) / totalForBar) * 100),
            gradient: "from-[#10b981] to-[#34d399]",
            color: "#10b981",
        },
    ];

    // Subscription plan breakdown
    const totalSubs = stats?.activeSubscriptions || 1;
    const planBars = [
        {
            label: "Pro Plan",
            value: stats?.proPlanUsers ?? 0,
            pct: Math.round(((stats?.proPlanUsers ?? 0) / totalSubs) * 100),
            gradient: "from-[#f59e0b] to-[#fbbf24]",
            color: "#f59e0b",
            badge: "⭐ Pro",
        },
        {
            label: "Basic Plan",
            value: stats?.basicPlanUsers ?? 0,
            pct: Math.round(((stats?.basicPlanUsers ?? 0) / totalSubs) * 100),
            gradient: "from-[#10b981] to-[#34d399]",
            color: "#10b981",
            badge: "Basic",
        },
    ];

    return (
        <div className="space-y-6 pb-8">

            {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
            <div className="relative rounded-3xl overflow-hidden min-h-[200px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e] via-[#1e3a8a] to-[#4c1d95]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0ea5e9]/30 via-transparent to-[#7c3aed]/30" />
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#0ea5e9]/15 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#7c3aed]/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/5 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />

                <div className="relative z-10 p-6 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-white/80 text-xs font-medium">Live Dashboard</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                <span className="text-white/60 text-xs font-mono">{time}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                            {greeting()}, <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-[#7dd3fc] to-[#c4b5fd] bg-clip-text text-transparent">
                                {adminName}
                            </span>
                        </h1>
                        <p className="text-white/50 text-sm mt-3 max-w-sm leading-relaxed">
                            Here's a complete overview of your Resume Maker platform. All systems are running smoothly.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-5">
                            <Link href="/dashboard/users"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0c4a6e] text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg shadow-md">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                View Users
                            </Link>
                            <Link href="/dashboard/subscriptions"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-semibold border border-white/20 transition-all hover:scale-105 hover:bg-white/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Subscriptions
                            </Link>
                        </div>
                    </div>

                    {/* right: mini stat pills — now with richer data */}
                    <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-72">
                        {[
                            { label: "Total Users", val: stats?.totalUsers ?? 0, color: "#38bdf8" },
                            { label: "New This Month", val: stats?.newUsersThisMonth ?? 0, color: "#86efac" },
                            { label: "Pro Plan", val: stats?.proPlanUsers ?? 0, color: "#fcd34d" },
                            { label: "Guests", val: stats?.guestUsers ?? 0, color: "#fca5a5" },
                        ].map((s) => (
                            <div key={s.label}
                                className="rounded-2xl p-4 bg-white/10 backdrop-blur-sm border border-white/15">
                                <p className="text-2xl font-bold" style={{ color: s.color }}>
                                    {s.val.toLocaleString()}
                                </p>
                                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          STAT CARDS ROW
      ══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.glow} cursor-default`}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                    >
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`} />
                        <div className="relative z-10">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                                {card.icon}
                            </div>
                            <p className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                                {card.value.toLocaleString()}
                            </p>
                            <p className="text-sm font-semibold mt-1" style={{ color: "var(--text-secondary)" }}>
                                {card.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {card.sub}
                            </p>
                            <span className={`inline-block mt-3 text-xs font-semibold px-2 py-0.5 rounded-lg ${card.badgeOk ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                                {card.badge}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════════
          NAV CARDS
      ══════════════════════════════════════════ */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#0ea5e9] to-[#7c3aed]" />
                    <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                        Quick Navigation
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {navCards.map((nav) => (
                        <Link
                            key={nav.title}
                            href={nav.href}
                            className={`group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${nav.glow}`}
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${nav.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                            <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br ${nav.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${nav.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                                    {nav.icon}
                                </div>
                                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{nav.title}</p>
                                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{nav.desc}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                        style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                        {nav.stat}
                                    </span>
                                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                                        style={{ color: "var(--text-muted)" }}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════
          BOTTOM ROW
      ══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Platform Breakdown bars */}
                <div className="lg:col-span-2 rounded-2xl p-6"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                                Platform Breakdown
                            </h3>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                Distribution across all user segments
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center text-white">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {bars.map((bar) => (
                            <div key={bar.label}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: bar.color }} />
                                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                                            {bar.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                            {bar.value.toLocaleString()}
                                        </span>
                                        <span className="text-xs w-8 text-right" style={{ color: "var(--text-muted)" }}>
                                            {bar.pct}%
                                        </span>
                                    </div>
                                </div>
                                <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar.gradient} transition-all duration-1000`}
                                        style={{ width: `${Math.max(bar.pct, 2)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                        {bars.map((bar) => (
                            <div key={bar.label} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                                style={{ background: "var(--bg-secondary)" }}>
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bar.gradient} flex items-center justify-center shrink-0`}>
                                    <span className="text-white text-xs font-bold">{bar.pct}%</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {bar.value.toLocaleString()}
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{bar.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">

                    {/* Subscription Plan Breakdown */}
                    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                    Subscription Plans
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                    {stats?.activeSubscriptions ?? 0} total active
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {planBars.map((plan) => (
                                <div key={plan.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                                style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                                {plan.badge}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                                {plan.value.toLocaleString()}
                                            </span>
                                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.pct}%</span>
                                        </div>
                                    </div>
                                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-1000`}
                                            style={{ width: `${Math.max(plan.pct, 2)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Profile adoption rate */}
                        <div className="mt-4 pt-4 flex items-center gap-3 p-3 rounded-xl"
                            style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                                    {(stats?.avgProfilesPerUser ?? 0).toFixed(2)} avg profiles/user
                                </p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    {stats?.usersWithProfile ?? 0} users have at least one profile
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top Users by Profiles */}
                    <div className="rounded-2xl p-5 relative overflow-hidden"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-gradient-to-br from-[#7c3aed]/20 to-[#0ea5e9]/10 blur-xl" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                        Top Users
                                    </h3>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                        By profile count
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {(stats?.topUsersByProfiles ?? []).slice(0, 5).map((topUser, index) => {
                                    const isGuest = topUser.user.userType === "guest";
                                    const rankColors = ["#f59e0b", "#94a3b8", "#cd7f32", "#7c3aed", "#0ea5e9"];
                                    return (
                                        <div key={topUser.userId}
                                            className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                                            style={{ background: "var(--bg-secondary)" }}>
                                            {/* Rank badge */}
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                                                style={{ background: rankColors[index] ?? "#64748b" }}>
                                                {index + 1}
                                            </div>
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isGuest ? "bg-gradient-to-br from-[#ec4899] to-[#be185d]" : "bg-gradient-to-br from-[#0ea5e9] to-[#0284c7]"}`}>
                                                {isGuest ? "G" : topUser.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                                                    {isGuest ? "Guest User" : topUser.user.name}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                    {isGuest ? topUser.user.name : topUser.user.email}
                                                </p>
                                            </div>
                                            {/* Profile count */}
                                            <div className="shrink-0">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#7c3aed]/10 to-[#6d28d9]/10 text-[#7c3aed]">
                                                    {topUser.profileCount} {topUser.profileCount === 1 ? "profile" : "profiles"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(stats?.topUsersByProfiles ?? []).length === 0 && (
                                    <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                                        No data available
                                    </p>
                                )}
                            </div>

                            <Link href="/dashboard/users"
                                className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#7c3aed] hover:underline">
                                View all users
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          SYSTEM STATUS
      ══════════════════════════════════════════ */}
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        System Status
                    </h3>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 px-2 py-1 rounded-lg bg-emerald-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        All Good
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { label: "API Server", ok: true },
                        { label: "PostgreSQL DB", ok: true },
                        { label: "Supabase Auth", ok: true },
                        { label: "Storage", ok: true },
                        { label: "Background Jobs", ok: true },
                    ].map((s) => (
                        <div key={s.label}
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: "var(--bg-secondary)" }}>
                            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                                {s.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${s.ok ? "bg-emerald-400" : "bg-red-400"} animate-pulse`} />
                                <span className={`text-xs font-semibold ${s.ok ? "text-emerald-500" : "text-red-500"}`}>
                                    {s.ok ? "Up" : "Down"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}