"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    userType: string;
    providerType: string;
    createdAt: string;
    Profile: {
        first_name: string;
        last_name: string;
        job_title: string;
        city: string;
        country: string;
        photo_url: string;
    } | null;
    UserSubscription: {
        status: string;
        SubscriptionPlan: { plan_tier: string; name: string };
    } | null;
}

type TabType = "all" | "user" | "guest";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<TabType>("all");
    const [view, setView] = useState<"table" | "grid">("table");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/getAllUsers");
            // handle both array response and paginated response
            const data = Array.isArray(res.data)
                ? res.data
                : res.data.data?.users || res.data.data || [];
            setUsers(data);
            setFiltered(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setUsers([]);
            setFiltered([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter by tab + search
    useEffect(() => {
        let result = users;

        if (tab !== "all") {
            result = result.filter((u) => u.userType === tab);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (u) =>
                    u.name?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q)
            );
        }

        setFiltered(result);
    }, [tab, search, users]);

    const counts = {
        all: users.length,
        user: users.filter((u) => u.userType === "user").length,
        guest: users.filter((u) => u.userType === "guest").length,
    };

    const getPlan = (user: User) => {
        const tier = user.UserSubscription?.SubscriptionPlan?.plan_tier || "basic";
        const map: Record<string, { label: string; color: string; bg: string }> = {
            premium_pro: { label: "Pro", color: "#8b5cf6", bg: "#8b5cf615" },
            premium: { label: "Premium", color: "#0ea5e9", bg: "#0ea5e915" },
            basic: { label: "Basic", color: "#64748b", bg: "#64748b15" },
        };
        return map[tier] || map.basic;
    };

    const gradients = [
        "from-[#0ea5e9] to-[#7c3aed]",
        "from-[#7c3aed] to-[#ec4899]",
        "from-[#10b981] to-[#0ea5e9]",
        "from-[#f59e0b] to-[#ef4444]",
        "from-[#ec4899] to-[#8b5cf6]",
        "from-[#0ea5e9] to-[#10b981]",
    ];

    const tabs: { key: TabType; label: string; color: string }[] = [
        { key: "all", label: "All Users", color: "#0ea5e9" },
        { key: "user", label: "Members", color: "#10b981" },
        { key: "guest", label: "Guests", color: "#f59e0b" },
    ];

    return (
        <div className="space-y-5 pb-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Users
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {users.length} total users registered
                    </p>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <button onClick={() => setView("table")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                            background: view === "table" ? "var(--accent)" : "transparent",
                            color: view === "table" ? "white" : "var(--text-muted)",
                        }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 10h18M3 14h18M10 6h11M10 18h11M3 6h.01M3 18h.01" />
                        </svg>
                        Table
                    </button>
                    <button onClick={() => setView("grid")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                            background: view === "grid" ? "var(--accent)" : "transparent",
                            color: view === "grid" ? "white" : "var(--text-muted)",
                        }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Grid
                    </button>
                </div>
            </div>

            {/* ── TABS ── */}
            <div className="flex flex-col sm:flex-row gap-3">

                {/* Tab buttons */}
                <div className="flex gap-2">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                            style={{
                                background: tab === t.key ? t.color + "20" : "var(--bg-card)",
                                color: tab === t.key ? t.color : "var(--text-secondary)",
                                border: tab === t.key
                                    ? `1px solid ${t.color}40`
                                    : "1px solid var(--border)",
                            }}
                        >
                            {t.label}
                            <span
                                className="px-1.5 py-0.5 rounded-md text-xs font-bold min-w-[20px] text-center"
                                style={{
                                    background: tab === t.key ? t.color : "var(--bg-secondary)",
                                    color: tab === t.key ? "white" : "var(--text-muted)",
                                }}
                            >
                                {counts[t.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "var(--text-muted)" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                        }}
                    />
                </div>
            </div>

            {/* ── STAT PILLS ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total", value: counts.all, color: "#0ea5e9", gradient: "from-[#0ea5e9] to-[#7c3aed]" },
                    { label: "Members", value: counts.user, color: "#10b981", gradient: "from-[#10b981] to-[#0ea5e9]" },
                    { label: "Guests", value: counts.guest, color: "#f59e0b", gradient: "from-[#f59e0b] to-[#ef4444]" },
                ].map((s) => (
                    <div key={s.label}
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shrink-0`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                                {s.value}
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/10 to-[#7c3aed]/10 flex items-center justify-center">
                        <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                        No {tab !== "all" ? tab : ""} users found
                    </p>
                </div>

            ) : view === "table" ? (

                /* TABLE VIEW */
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    {["User", "Profile", "Email", "Type", "Plan", "Provider", "Joined", "Action"].map((h) => (
                                        <th key={h}
                                            className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user, i) => {
                                    const plan = getPlan(user);
                                    const grad = gradients[i % gradients.length];
                                    const displayName = user.Profile?.first_name
                                        ? `${user.Profile.first_name} ${user.Profile.last_name || ""}`.trim()
                                        : user.name || "—";
                                    const isUser = user.userType === "user";

                                    return (
                                        <tr key={user.id}
                                            style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                                            className="transition-colors hover:bg-[#0ea5e9]/5">

                                            {/* User */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.Profile?.photo_url ? (
                                                        <img src={user.Profile.photo_url} alt={displayName}
                                                            className="w-9 h-9 rounded-xl object-cover shrink-0" />
                                                    ) : (
                                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                                            {displayName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                                            {displayName}
                                                        </p>
                                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                            {user.id.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Profile */}
                                            <td className="px-5 py-4">
                                                {user.Profile?.job_title ? (
                                                    <>
                                                        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                                                            {user.Profile.job_title}
                                                        </p>
                                                        {user.Profile.city && (
                                                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                                {[user.Profile.city, user.Profile.country].filter(Boolean).join(", ")}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 rounded-lg"
                                                        style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                        No profile
                                                    </span>
                                                )}
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-4">
                                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                                    {user.email || "—"}
                                                </p>
                                            </td>

                                            {/* Type */}
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit"
                                                    style={{
                                                        background: isUser ? "#10b98115" : "#f59e0b15",
                                                        color: isUser ? "#10b981" : "#f59e0b",
                                                    }}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isUser ? "bg-emerald-400" : "bg-amber-400"}`} />
                                                    {isUser ? "Member" : "Guest"}
                                                </span>
                                            </td>

                                            {/* Plan */}
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                                                    style={{ background: plan.bg, color: plan.color }}>
                                                    {plan.label}
                                                </span>
                                            </td>

                                            {/* Provider */}
                                            <td className="px-5 py-4">
                                                <span className="text-xs capitalize px-2.5 py-1 rounded-lg font-medium"
                                                    style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                                    {user.providerType}
                                                </span>
                                            </td>

                                            {/* Joined */}
                                            <td className="px-5 py-4">
                                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                        month: "short", day: "numeric", year: "numeric"
                                                    })}
                                                </p>
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-4">
                                                <Link href={`/dashboard/users/${user.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                                    style={{ background: "#0ea5e915", color: "#0ea5e9" }}>
                                                    View
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            ) : (

                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((user, i) => {
                        const plan = getPlan(user);
                        const grad = gradients[i % gradients.length];
                        const isUser = user.userType === "user";
                        const displayName = user.Profile?.first_name
                            ? `${user.Profile.first_name} ${user.Profile.last_name || ""}`.trim()
                            : user.name || "Unknown";

                        return (
                            <div key={user.id}
                                className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>

                                <div className={`h-20 bg-gradient-to-br ${grad} relative overflow-hidden`}>
                                    <div className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
                                            backgroundSize: "20px 20px",
                                        }} />
                                </div>

                                <div className="px-5 pb-5">
                                    <div className="-mt-7 mb-3 flex items-end justify-between">
                                        {user.Profile?.photo_url ? (
                                            <img src={user.Profile.photo_url} alt={displayName}
                                                className="w-14 h-14 rounded-xl object-cover border-4"
                                                style={{ borderColor: "var(--bg-card)" }} />
                                        ) : (
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-bold border-4`}
                                                style={{ borderColor: "var(--bg-card)" }}>
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg mb-1"
                                            style={{
                                                background: isUser ? "#10b98115" : "#f59e0b15",
                                                color: isUser ? "#10b981" : "#f59e0b",
                                            }}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isUser ? "bg-emerald-400" : "bg-amber-400"}`} />
                                            {isUser ? "Member" : "Guest"}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                        {displayName}
                                    </h3>

                                    {user.Profile?.job_title ? (
                                        <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>
                                            {user.Profile.job_title}
                                        </p>
                                    ) : (
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>No profile</p>
                                    )}

                                    {user.email && (
                                        <div className="flex items-center gap-1 mt-1.5">
                                            <svg className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                {user.email}
                                            </p>
                                        </div>
                                    )}

                                    {(user.Profile?.city || user.Profile?.country) && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <svg className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                {[user.Profile.city, user.Profile.country].filter(Boolean).join(", ")}
                                            </p>
                                        </div>
                                    )}

                                    <div className="my-3" style={{ borderTop: "1px solid var(--border)" }} />

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                            style={{ background: plan.bg, color: plan.color }}>
                                            {plan.label}
                                        </span>
                                        <Link href={`/dashboard/users/${user.id}`}
                                            className="flex items-center gap-1 text-xs font-semibold transition-all hover:gap-2"
                                            style={{ color: "var(--accent)" }}>
                                            View Profile
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Results count */}
            {!loading && filtered.length > 0 && (
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    Showing {filtered.length} of {users.length} users
                </p>
            )}
        </div>
    );
}