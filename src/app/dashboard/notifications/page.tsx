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
    Panel,
    StatGrid,
    UserLink,
    tableCellClass,
    tableRowBorder,
    tableRowClass,
} from "@/components/admin/AdminUI";

interface PushStats {
    totalSent: number;
    clickRate: string;
    unreadCount: number;
    last24h: { sent: number };
    jobAlerts: { totalSent: number; last24h: { sent: number } };
}

interface ActivityRow {
    id: string;
    kind: "push" | "job";
    userId: string;
    title: string;
    body: string;
    sentAt: string;
    clickedAt: string | null;
    type: string;
    user?: { name: string; email: string; userType: string };
}

function formatWhen(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

const TABLE_COLUMNS = [
    { label: "User", className: "w-[20%]" },
    { label: "Type", className: "w-[12%]" },
    { label: "Message", className: "w-[40%]" },
    { label: "Sent", className: "w-[16%]" },
    { label: "Status", className: "w-[12%]" },
];

export default function NotificationsPage() {
    const [stats, setStats] = useState<PushStats | null>(null);
    const [activity, setActivity] = useState<ActivityRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ limit: "50" });
            if (filter === "unread") params.set("unreadOnly", "true");

            const [statsRes, pushRes, jobRes] = await Promise.all([
                api.get("/admin/push/stats"),
                api.get(`/admin/push/recent?${params}`),
                api.get(`/admin/push/recent-jobs?${params}`),
            ]);

            setStats(statsRes.data?.data ?? null);

            const rows: ActivityRow[] = [
                ...(pushRes.data?.data ?? []).map((r: ActivityRow) => ({
                    id: r.id,
                    kind: "push" as const,
                    userId: r.userId,
                    title: r.title,
                    body: r.body,
                    sentAt: r.sentAt,
                    clickedAt: r.clickedAt,
                    type: "Push",
                    user: r.user,
                })),
                ...(jobRes.data?.data ?? []).map((r: ActivityRow) => ({
                    id: r.id,
                    kind: "job" as const,
                    userId: r.userId,
                    title: r.title,
                    body: r.body,
                    sentAt: r.sentAt,
                    clickedAt: r.clickedAt,
                    type: "Job alert",
                    user: r.user,
                })),
            ].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

            setActivity(rows);
        } catch {
            setError("Unable to load notifications.");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    return (
        <PageShell>
            <PageHeader title="Notifications" description="Push messages and job alerts sent to users." />

            {stats && !loading && (
                <StatGrid
                    items={[
                        { label: "Total sent", value: stats.totalSent + stats.jobAlerts.totalSent },
                        { label: "Unread", value: stats.unreadCount },
                        { label: "Click rate", value: stats.clickRate },
                        { label: "Sent last 24h", value: stats.last24h.sent + stats.jobAlerts.last24h.sent },
                    ]}
                />
            )}

            <div className="flex gap-2">
                {(["all", "unread"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="px-3 py-1.5 rounded-lg text-sm capitalize"
                        style={{
                            background: filter === f ? "var(--text-primary)" : "var(--bg-card)",
                            color: filter === f ? "var(--bg-primary)" : "var(--text-secondary)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        {f === "all" ? "All" : "Unread"}
                    </button>
                ))}
            </div>

            {error && !loading && <ErrorBanner message={error} />}

            <Panel title="Recent activity" noPadding>
                <PageContent loading={loading} error={null} isEmpty={activity.length === 0} emptyMessage="No notifications yet.">
                    <DataTable columns={TABLE_COLUMNS}>
                        {activity.map((row) => (
                            <tr key={`${row.kind}-${row.id}`} className={tableRowClass()} style={tableRowBorder()}>
                                <td className={tableCellClass()}>
                                    <UserLink
                                        userId={row.userId}
                                        name={row.user?.name}
                                        email={row.user?.email}
                                        guest={row.user?.userType === "guest"}
                                    />
                                </td>
                                <td className={tableCellClass()}>
                                    <Badge tone={row.kind === "push" ? "purple" : "sky"}>{row.type}</Badge>
                                </td>
                                <td className={tableCellClass()}>
                                    <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{row.title}</p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{row.body}</p>
                                </td>
                                <td className={`${tableCellClass()} whitespace-nowrap`} style={{ color: "var(--text-secondary)" }}>
                                    {formatWhen(row.sentAt)}
                                </td>
                                <td className={tableCellClass()}>
                                    <Badge tone={row.clickedAt ? "success" : "warning"}>
                                        {row.clickedAt ? "Read" : "Unread"}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </DataTable>
                </PageContent>
            </Panel>
        </PageShell>
    );
}
