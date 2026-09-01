"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Badge,
    DataTable,
    ErrorBanner,
    PageContent,
    PageHeader,
    PageShell,
    PaginationBar,
    Panel,
    SELECT_CLASS,
    StatGrid,
    UserLink,
    formatBillingCycle,
    tableCellClass,
    tableRowBorder,
    tableRowClass,
} from "@/components/admin/AdminUI";

interface Subscription {
    id: string;
    userId: string;
    status: string;
    billing_cycle: string;
    expires_at: string;
    is_trial: boolean;
    daysRemaining: number | null;
    isExpired?: boolean;
    isLifetime?: boolean;
    isExpiringSoon?: boolean;
    subscriptionPlan: { plan_tier: string };
    user: { name: string; email: string; userType: string };
}

interface Summary {
    total: number;
    active: number;
    expired: number;
    proPlan: number;
}

const PLAN_LABEL: Record<string, string> = {
    premium_pro: "Pro",
    basic: "Free",
    premium: "Legacy",
};

const STATUS_LABEL: Record<string, string> = {
    active: "Active",
    trial: "Trial",
    trial_started: "Trial",
    cancelled_active: "Cancelled",
    pending: "Pending",
    expired: "Expired",
};

const STATUS_TONE: Record<string, "success" | "warning" | "purple" | "neutral"> = {
    active: "success",
    trial: "purple",
    trial_started: "purple",
    cancelled_active: "warning",
    expired: "neutral",
    pending: "neutral",
};

function formatStatus(status: string) {
    return STATUS_LABEL[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatExpiryDate(iso: string, isLifetime?: boolean) {
    if (isLifetime) return "Lifetime";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    if (d.getUTCFullYear() >= 2100) return "Lifetime";
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

function formatDaysLeft(sub: Subscription) {
    if (sub.isLifetime || sub.daysRemaining == null) return "—";
    if (sub.isExpired || sub.daysRemaining <= 0) return "Expired";
    if (sub.isExpiringSoon) return `${sub.daysRemaining}d left`;
    return `${sub.daysRemaining}d`;
}

function daysLeftTone(sub: Subscription): "warning" | "neutral" | "success" {
    if (sub.isExpired || (sub.daysRemaining != null && sub.daysRemaining <= 0)) return "warning";
    if (sub.isExpiringSoon) return "warning";
    return "neutral";
}

const TABLE_COLUMNS = [
    { label: "User", className: "w-[28%]" },
    { label: "Plan", className: "w-[12%]" },
    { label: "Status", className: "w-[14%]" },
    { label: "Billing", className: "w-[14%]" },
    { label: "Expires", className: "w-[18%]" },
    { label: "Days left", className: "w-[14%]" },
];

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState("");
    const [tierFilter, setTierFilter] = useState("");
    const [cycleFilter, setCycleFilter] = useState("");
    const [showFree, setShowFree] = useState(true);
    const [page, setPage] = useState(1);

    const fetchSubs = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(p), limit: "20" });
            if (statusFilter) params.set("status", statusFilter);
            if (tierFilter) params.set("plan_tier", tierFilter);
            if (cycleFilter) params.set("billing_cycle", cycleFilter);

            const res = await api.get(`/admin/getAllSubscriptions?${params}`);
            let rows: Subscription[] = res.data?.data ?? [];
            if (!showFree) {
                rows = rows.filter(
                    (s) => !(s.subscriptionPlan?.plan_tier === "basic" && s.billing_cycle === "free")
                );
            }
            setSubs(rows);
            setSummary(res.data?.summary ?? null);
            setTotalPages(res.data?.pagination?.totalPages ?? 1);
        } catch {
            setSubs([]);
            setError("Unable to load subscriptions.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, tierFilter, cycleFilter, showFree]);

    useEffect(() => { setPage(1); }, [statusFilter, tierFilter, cycleFilter, showFree]);
    useEffect(() => { fetchSubs(page); }, [page, fetchSubs]);

    return (
        <PageShell>
            <PageHeader title="Subscriptions" description="User plans, billing, and trial status." />

            {summary && !loading && (
                <StatGrid
                    items={[
                        { label: "Total", value: summary.total },
                        { label: "Active", value: summary.active },
                        { label: "Pro", value: summary.proPlan },
                        { label: "Expired", value: summary.expired },
                    ]}
                />
            )}

            <div className="flex flex-wrap items-center gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={SELECT_CLASS}>
                    <option value="">All status</option>
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="expired">Expired</option>
                </select>
                <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className={SELECT_CLASS}>
                    <option value="">All plans</option>
                    <option value="basic">Free</option>
                    <option value="premium_pro">Pro</option>
                </select>
                <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} className={SELECT_CLASS}>
                    <option value="">All billing</option>
                    <option value="free">Free</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="lifetime">Lifetime</option>
                </select>
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <input type="checkbox" checked={showFree} onChange={(e) => setShowFree(e.target.checked)} />
                    Show free accounts
                </label>
            </div>

            {error && !loading && <ErrorBanner message={error} />}

            <Panel noPadding>
                <PageContent loading={loading} error={null} isEmpty={subs.length === 0} emptyMessage="No subscriptions match your filters.">
                    <DataTable columns={TABLE_COLUMNS}>
                        {subs.map((sub) => {
                            const tier = sub.subscriptionPlan?.plan_tier ?? "basic";
                            const displayStatus = sub.status;
                            const tone = STATUS_TONE[displayStatus] ?? "neutral";
                            const daysTone = daysLeftTone(sub);
                            const daysLabel = formatDaysLeft(sub);
                            return (
                                <tr key={sub.id} className={tableRowClass()} style={tableRowBorder()}>
                                    <td className={tableCellClass()}>
                                        <UserLink
                                            userId={sub.userId}
                                            name={sub.user?.name}
                                            email={sub.user?.email}
                                            guest={sub.user?.userType === "guest"}
                                        />
                                    </td>
                                    <td className={tableCellClass()}>
                                        <Badge tone={tier === "premium_pro" ? "purple" : "neutral"}>
                                            {PLAN_LABEL[tier] ?? tier}
                                        </Badge>
                                        {sub.is_trial && (
                                            <span className="ml-1.5 text-xs" style={{ color: "var(--text-muted)" }}>trial</span>
                                        )}
                                    </td>
                                    <td className={tableCellClass()}>
                                        <Badge tone={tone} size="md">{formatStatus(displayStatus)}</Badge>
                                    </td>
                                    <td className={tableCellClass()} style={{ color: "var(--text-secondary)" }}>
                                        {formatBillingCycle(sub.billing_cycle)}
                                    </td>
                                    <td className={tableCellClass()} style={{ color: "var(--text-secondary)" }}>
                                        {formatExpiryDate(sub.expires_at, sub.isLifetime)}
                                    </td>
                                    <td className={tableCellClass()}>
                                        {daysLabel === "Expired" ? (
                                            <Badge tone="warning" size="md">Expired</Badge>
                                        ) : daysLabel === "—" ? (
                                            <span style={{ color: "var(--text-muted)" }}>—</span>
                                        ) : (
                                            <span
                                                className="text-sm font-semibold tabular-nums"
                                                style={{
                                                    color: daysTone === "warning" ? "#fbbf24" : "var(--text-secondary)",
                                                }}
                                            >
                                                {daysLabel}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </DataTable>
                </PageContent>
            </Panel>

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
