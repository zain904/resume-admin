"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface SubscriptionPlan {
    id: string;
    plan_tier: string;
    name: string;
    description: string;
    monthly_price: string;
    annual_price: string;
    profile_allowed: number;
    template_allowed: number;
    ai_feature: boolean;
    history_feature: boolean;
    is_free: boolean;
    is_popular: boolean;
}

interface SubUser {
    id: string;
    name: string;
    email: string;
    userType: string;
    providerType: string;
    createdAt: string;
}

interface Subscription {
    id: string;
    userId: string;
    subscription_plan_id: string;
    status: string;
    billing_cycle: string;
    started_at: string;
    expires_at: string;
    auto_renew: boolean;
    createdAt: string;
    updatedAt: string;
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysRemaining: number;
    subscriptionPlan: SubscriptionPlan;
    user: SubUser;
}

interface Summary {
    total: number;
    active: number;
    expired: number;
    basicPlan: number;
    proPlan: number;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const TIER_MAP: Record<string, { label: string; color: string; bg: string }> = {
    premium_pro: { label: "Pro ⭐", color: "#8b5cf6", bg: "#8b5cf615" },
    premium: { label: "Premium", color: "#0ea5e9", bg: "#0ea5e915" },
    basic: { label: "Basic", color: "#64748b", bg: "#64748b15" },
};

const STATUS_MAP: Record<string, { color: string; bg: string; dot: string }> = {
    active: { color: "#10b981", bg: "#10b98115", dot: "bg-emerald-400" },
    expired: { color: "#ef4444", bg: "#ef444415", dot: "bg-red-400" },
    cancelled: { color: "#f59e0b", bg: "#f59e0b15", dot: "bg-amber-400" },
};

function formatDate(iso: string) {
    const d = new Date(iso);
    if (d.getFullYear() > 2100) return "Lifetime";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 15, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [tierFilter, setTierFilter] = useState("");
    const [cycleFilter, setCycleFilter] = useState("");
    const [page, setPage] = useState(1);

    const fetchSubs = async (p = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p.toString(), limit: "15" });
            if (statusFilter) params.set("status", statusFilter);
            if (tierFilter) params.set("plan_tier", tierFilter);
            if (cycleFilter) params.set("billing_cycle", cycleFilter);

            const res = await api.get(`/admin/getAllSubscriptions?${params}`);
            setSubs(res.data.data ?? []);
            setSummary(res.data.summary ?? null);
            setPagination(res.data.pagination ?? { total: 0, page: p, limit: 15, totalPages: 1 });
        } catch {
            setSubs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPage(1); fetchSubs(1); }, [statusFilter, tierFilter, cycleFilter]);
    useEffect(() => { fetchSubs(page); }, [page]);

    return (
        <div className="space-y-5 pb-6">

            {/* ── Header ───────────────────────────────────────── */}
            <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Subscriptions</h2>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {pagination.total} total subscriptions
                </p>
            </div>

            {/* ── Summary pills ────────────────────────────────── */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: "Total", value: summary.total, color: "#0ea5e9", bg: "#0ea5e915" },
                        { label: "Active", value: summary.active, color: "#10b981", bg: "#10b98115" },
                        { label: "Expired", value: summary.expired, color: "#ef4444", bg: "#ef444415" },
                        { label: "Basic", value: summary.basicPlan, color: "#64748b", bg: "#64748b15" },
                        { label: "Pro", value: summary.proPlan, color: "#8b5cf6", bg: "#8b5cf615" },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Filters ──────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3">
                {/* Status */}
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {/* Plan tier */}
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="">All Plans</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="premium_pro">Pro</option>
                </select>

                {/* Billing cycle */}
                <select value={cycleFilter} onChange={e => setCycleFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="">All Cycles</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                </select>

                {(statusFilter || tierFilter || cycleFilter) && (
                    <button onClick={() => { setStatusFilter(""); setTierFilter(""); setCycleFilter(""); }}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium"
                        style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                        Clear filters
                    </button>
                )}
            </div>

            {/* ── Table ────────────────────────────────────────── */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-7 h-7 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : subs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <svg className="w-10 h-10" style={{ color: "var(--text-muted)" }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No subscriptions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    {["User", "Plan", "Status", "Billing", "Features", "Started", "Expires", "Days Left"].map(h => (
                                        <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {subs.map((sub, i) => {
                                    const tier = TIER_MAP[sub.subscriptionPlan?.plan_tier] ?? TIER_MAP.basic;
                                    const stat = STATUS_MAP[sub.status] ?? STATUS_MAP.active;
                                    const isGuest = sub.user?.userType === "guest";

                                    return (
                                        <tr key={sub.id}
                                            style={{ borderBottom: i < subs.length - 1 ? "1px solid var(--border)" : "none" }}
                                            className="transition-colors hover:bg-[#0ea5e9]/5">

                                            {/* User */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${isGuest ? "bg-gradient-to-br from-[#ec4899] to-[#be185d]" : "bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed]"}`}>
                                                        {(sub.user?.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                                            {isGuest ? "Guest User" : (sub.user?.name || "—")}
                                                        </p>
                                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                            {sub.user?.email || sub.user?.name || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Plan */}
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                                    style={{ background: tier.bg, color: tier.color }}>
                                                    {tier.label}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit"
                                                    style={{ background: stat.bg, color: stat.color }}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} animate-pulse`} />
                                                    {sub.status}
                                                </span>
                                            </td>

                                            {/* Billing */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                                                    {sub.billing_cycle || "—"}
                                                </span>
                                            </td>

                                            {/* Features */}
                                            <td className="px-5 py-4">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    <span className="text-xs px-1.5 py-0.5 rounded"
                                                        style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                        {sub.subscriptionPlan?.profile_allowed ?? 0} profile{(sub.subscriptionPlan?.profile_allowed ?? 0) !== 1 ? "s" : ""}
                                                    </span>
                                                    {sub.subscriptionPlan?.ai_feature && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#8b5cf6]/10 text-[#8b5cf6]">AI</span>
                                                    )}
                                                    {sub.subscriptionPlan?.history_feature && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9]">History</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Started */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                                    {formatDate(sub.started_at)}
                                                </span>
                                            </td>

                                            {/* Expires */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                                    {formatDate(sub.expires_at)}
                                                </span>
                                            </td>

                                            {/* Days remaining */}
                                            <td className="px-5 py-4">
                                                <span className={`text-sm font-semibold ${sub.isExpiringSoon ? "text-amber-500" : sub.isExpired ? "text-red-500" : ""}`}
                                                    style={!sub.isExpiringSoon && !sub.isExpired ? { color: "var(--text-secondary)" } : {}}>
                                                    {sub.daysRemaining > 36000 ? "∞" : `${sub.daysRemaining}d`}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Pagination ───────────────────────────────────── */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                            Previous
                        </button>
                        <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
                            style={{ background: "#0ea5e9", color: "white" }}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}