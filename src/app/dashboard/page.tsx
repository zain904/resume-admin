"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
    LoadingState,
    PageShell,
    Panel,
    ProgressBarList,
    QuickNavGrid,
    StatGrid,
    UserLink,
} from "@/components/admin/AdminUI";

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

    useEffect(() => {
        setAdminName(localStorage.getItem("admin_full_name") || "Admin");
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/stats");
                setStats(res.data.data);
            } catch {
                setStats(null);
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

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    if (loading) {
        return (
            <PageShell>
                <LoadingState message="Loading dashboard…" />
            </PageShell>
        );
    }

    const s = stats ?? {
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
    };

    const totalUsers = Math.max(s.totalUsers, 1);
    const totalSubs = Math.max(s.activeSubscriptions, 1);

    const segmentBars = [
        { label: "Regular members", value: s.regularUsers, color: "#0ea5e9" },
        { label: "Guest users", value: s.guestUsers, color: "#f43f5e" },
        { label: "With profile", value: s.usersWithProfile, color: "#8b5cf6" },
        { label: "Subscribed", value: s.activeSubscriptions, color: "#10b981" },
    ];

    const planBars = [
        { label: "Pro plan", value: s.proPlanUsers, color: "#f59e0b" },
        { label: "Free plan", value: s.basicPlanUsers, color: "#10b981" },
    ];

    const quickLinks = [
        { title: "Users", desc: "Accounts, profiles, and activity", href: "/dashboard/users", stat: `${s.totalUsers} total`, color: "#0ea5e9" },
        { title: "Profiles", desc: "Browse all resume profiles", href: "/dashboard/profiles", stat: `${s.totalProfiles} profiles`, color: "#8b5cf6" },
        { title: "Subscriptions", desc: "Plans, billing, and trials", href: "/dashboard/subscriptions", stat: `${s.activeSubscriptions} active`, color: "#10b981" },
        { title: "Onboarding", desc: "Conversion funnel analytics", href: "/dashboard/onboarding", stat: "View funnel", color: "#f59e0b" },
    ];

    return (
        <PageShell>
            {/* Header */}
            <div
                className="rounded-xl px-5 py-5 lg:px-6 lg:py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        {today}
                    </p>
                    <h1 className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
                        {greeting()}, {adminName}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        Platform overview — users, profiles, and subscriptions at a glance.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/dashboard/users"
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--accent)" }}
                    >
                        Manage users
                    </Link>
                    <Link
                        href="/dashboard/onboarding"
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                        }}
                    >
                        View funnel
                    </Link>
                </div>
            </div>

            {/* KPI row */}
            <StatGrid
                items={[
                    {
                        label: "Total users",
                        value: s.totalUsers,
                        sub: `+${s.newUsersThisMonth} this month`,
                        accent: "sky",
                    },
                    {
                        label: "Total profiles",
                        value: s.totalProfiles,
                        sub: `+${s.newProfilesThisMonth} this month`,
                        accent: "purple",
                    },
                    {
                        label: "Active subscriptions",
                        value: s.activeSubscriptions,
                        sub: `${s.proPlanUsers} Pro · ${s.basicPlanUsers} Free`,
                        accent: "green",
                    },
                    {
                        label: "Guest users",
                        value: s.guestUsers,
                        sub: `${s.usersWithoutProfile} without profile`,
                        accent: "rose",
                    },
                ]}
            />

            {/* Quick nav */}
            <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                    Quick access
                </h2>
                <QuickNavGrid items={quickLinks} />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Panel
                    title="User segments"
                    subtitle={`${s.totalUsers.toLocaleString()} total users`}
                    className="lg:col-span-2"
                    highlight="sky"
                >
                    <ProgressBarList items={segmentBars} total={totalUsers} />
                    <div
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5"
                        style={{ borderTop: "1px solid var(--border)" }}
                    >
                        {[
                            { label: "Avg profiles/user", value: s.avgProfilesPerUser.toFixed(1) },
                            { label: "Regular members", value: s.regularUsers.toLocaleString() },
                            { label: "New users (month)", value: s.newUsersThisMonth.toLocaleString() },
                            { label: "New profiles (month)", value: s.newProfilesThisMonth.toLocaleString() },
                        ].map((item) => (
                            <div key={item.label} className="rounded-lg px-3 py-2.5" style={{ background: "var(--bg-secondary)" }}>
                                <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                                    {item.value}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="Subscription plans" subtitle={`${s.activeSubscriptions} active`} highlight="green">
                    <ProgressBarList items={planBars} total={totalSubs} />
                    <Link
                        href="/dashboard/subscriptions"
                        className="inline-flex items-center gap-1 mt-5 text-xs font-semibold hover:underline"
                        style={{ color: "var(--accent)" }}
                    >
                        View all subscriptions
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </Panel>
            </div>

            {/* Top users */}
            <Panel title="Top users by profiles" subtitle="Most active profile creators" highlight="purple">
                {s.topUsersByProfiles.length === 0 ? (
                    <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                        No profile data yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {s.topUsersByProfiles.slice(0, 6).map((topUser, index) => (
                            <div
                                key={topUser.userId}
                                className="flex items-center gap-3 p-3 rounded-lg"
                                style={{ background: "var(--bg-secondary)" }}
                            >
                                <span
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                    style={{
                                        background: index === 0 ? "rgba(245,158,11,0.15)" : "var(--bg-card)",
                                        color: index === 0 ? "#fbbf24" : "var(--text-muted)",
                                    }}
                                >
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <UserLink
                                        userId={topUser.userId}
                                        name={topUser.user.userType === "guest" ? "Guest" : topUser.user.name}
                                        email={topUser.user.email}
                                        guest={topUser.user.userType === "guest"}
                                    />
                                </div>
                                <span
                                    className="text-xs font-bold px-2 py-1 rounded-md shrink-0 tabular-nums"
                                    style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}
                                >
                                    {topUser.profileCount}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </PageShell>
    );
}
