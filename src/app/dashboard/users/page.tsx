"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
    Badge,
    DataTable,
    LoadingState,
    PageHeader,
    PageShell,
    PaginationBar,
    Panel,
    StatGrid,
    tableCellClass,
    tableRowBorder,
    tableRowClass,
} from "@/components/admin/AdminUI";

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
        SubscriptionPlan: { plan_tier: string; name: string } | null;
    } | null;
}

type TabType = "all" | "user" | "guest";

const PAGE_SIZE = 20;

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [tab, setTab] = useState<TabType>("all");
    const [view, setView] = useState<"table" | "grid">("table");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [summary, setSummary] = useState({ total: 0, members: 0, guests: 0 });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, tab]);

    const fetchUsers = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(p),
                limit: String(PAGE_SIZE),
            });
            if (tab !== "all") params.set("userType", tab);
            if (debouncedSearch) params.set("search", debouncedSearch);

            const res = await api.get(`/admin/getAllUsers?${params}`);
            const body = res.data;
            const data = Array.isArray(body)
                ? body
                : body?.data?.users || body?.data || [];

            setUsers(Array.isArray(data) ? data : []);
            setSummary({
                total: body?.summary?.total ?? 0,
                members: body?.summary?.members ?? 0,
                guests: body?.summary?.guests ?? 0,
            });
            setFilteredTotal(body?.pagination?.total ?? (Array.isArray(data) ? data.length : 0));
            setTotalPages(body?.pagination?.totalPages ?? 1);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setUsers([]);
            setFilteredTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, tab]);

    useEffect(() => {
        fetchUsers(page);
    }, [page, fetchUsers]);

    const counts = {
        all: summary.total,
        user: summary.members,
        guest: summary.guests,
    };

    const getPlan = (user: User) => {
        const tier = user.UserSubscription?.SubscriptionPlan?.plan_tier || "basic";
        const map: Record<string, { label: string; color: string; bg: string }> = {
            premium_pro: { label: "Pro", color: "#8b5cf6", bg: "#8b5cf615" },
            basic: { label: "Free", color: "#64748b", bg: "#64748b15" },
            premium: { label: "Legacy", color: "#94a3b8", bg: "#94a3b815" },
        };
        return map[tier] || map.basic;
    };

    const displayNameOf = (user: User, fallback = "—") => {
        if (user.Profile?.first_name) {
            return `${user.Profile.first_name} ${user.Profile.last_name || ""}`.trim();
        }
        return user.name || fallback;
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

    const TABLE_COLUMNS = [
        { label: "User", className: "w-[22%]" },
        { label: "Profile", className: "w-[18%]" },
        { label: "Email", className: "w-[20%]" },
        { label: "Type", className: "w-[10%]" },
        { label: "Plan", className: "w-[10%]" },
        { label: "Provider", className: "w-[10%]" },
        { label: "Joined", className: "w-[10%]" },
        { label: "", className: "w-[8%]" },
    ];

    return (
        <PageShell>
            <PageHeader
                title="Users"
                description={`${summary.total.toLocaleString()} total users registered`}
                action={
                    <div className="flex items-center gap-1 p-1 rounded-xl"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <button onClick={() => setView("table")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: view === "table" ? "var(--accent)" : "transparent",
                                color: view === "table" ? "white" : "var(--text-muted)",
                            }}>
                            Table
                        </button>
                        <button onClick={() => setView("grid")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: view === "grid" ? "var(--accent)" : "transparent",
                                color: view === "grid" ? "white" : "var(--text-muted)",
                            }}>
                            Grid
                        </button>
                    </div>
                }
            />

            <div className="flex flex-col sm:flex-row gap-3">
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
                                {counts[t.key].toLocaleString()}
                            </span>
                        </button>
                    ))}
                </div>

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

            <StatGrid
                items={[
                    { label: "Total", value: counts.all },
                    { label: "Members", value: counts.user },
                    { label: "Guests", value: counts.guest },
                ]}
            />

            {loading ? (
                <LoadingState />
            ) : users.length === 0 ? (
                <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
                    No {tab !== "all" ? tab : ""} users found
                </p>
            ) : view === "table" ? (
                <Panel noPadding>
                    <DataTable columns={TABLE_COLUMNS}>
                        {users.map((user, i) => {
                            const plan = getPlan(user);
                            const grad = gradients[i % gradients.length];
                            const displayName = displayNameOf(user);
                            const isUser = user.userType === "user";

                            return (
                                <tr key={user.id} className={tableRowClass()} style={tableRowBorder()}>
                                    <td className={tableCellClass()}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            {user.Profile?.photo_url ? (
                                                <img src={user.Profile.photo_url} alt={displayName}
                                                    className="w-9 h-9 rounded-xl object-cover shrink-0" />
                                            ) : (
                                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                                                    {displayName}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                    {user.id.slice(0, 8)}…
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={tableCellClass()}>
                                        {user.Profile?.job_title ? (
                                            <>
                                                <p className="text-sm font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                                                    {user.Profile.job_title}
                                                </p>
                                                {user.Profile.city && (
                                                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                                                        {[user.Profile.city, user.Profile.country].filter(Boolean).join(", ")}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>No profile</span>
                                        )}
                                    </td>
                                    <td className={`${tableCellClass()} truncate`} style={{ color: "var(--text-secondary)" }}>
                                        {user.email || "—"}
                                    </td>
                                    <td className={tableCellClass()}>
                                        <Badge tone={isUser ? "success" : "warning"}>
                                            {isUser ? "Member" : "Guest"}
                                        </Badge>
                                    </td>
                                    <td className={tableCellClass()}>
                                        <Badge tone={plan.label === "Pro" ? "purple" : "neutral"}>{plan.label}</Badge>
                                    </td>
                                    <td className={`${tableCellClass()} capitalize`} style={{ color: "var(--text-secondary)" }}>
                                        {user.providerType}
                                    </td>
                                    <td className={tableCellClass()} style={{ color: "var(--text-secondary)" }}>
                                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                        })}
                                    </td>
                                    <td className={tableCellClass()}>
                                        <Link href={`/dashboard/users/${user.id}`}
                                            className="text-xs font-semibold hover:underline"
                                            style={{ color: "var(--accent)" }}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </DataTable>
                </Panel>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {users.map((user, i) => {
                        const plan = getPlan(user);
                        const grad = gradients[i % gradients.length];
                        const isUser = user.userType === "user";
                        const displayName = displayNameOf(user, "Unknown");

                        return (
                            <div key={user.id}
                                className="rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>

                                <div className={`h-24 rounded-t-2xl bg-gradient-to-br ${grad} relative overflow-hidden`}>
                                    <div className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
                                            backgroundSize: "20px 20px",
                                        }} />
                                </div>

                                <div className="px-5 pb-5">
                                    <div className="relative z-10 -mt-8 mb-3 flex items-end justify-between">
                                        {user.Profile?.photo_url ? (
                                            <img src={user.Profile.photo_url} alt={displayName}
                                                className="w-16 h-16 rounded-xl object-cover shrink-0 border-4"
                                                style={{ borderColor: "var(--bg-card)" }} />
                                        ) : (
                                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-bold shrink-0 border-4`}
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

            {!loading && users.length > 0 && (
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    Showing {users.length} of {filteredTotal.toLocaleString()} users
                </p>
            )}

            <PaginationBar
                page={page}
                totalPages={totalPages}
                disabled={loading}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
        </PageShell>
    );
}
