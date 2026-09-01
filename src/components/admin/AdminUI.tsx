"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/* ─── Layout ────────────────────────────────────────────────────────── */

export function PageShell({ children }: { children: React.ReactNode }) {
    return <div className="w-full max-w-none space-y-5 pb-6">{children}</div>;
}

export function PageContent({
    loading,
    error,
    isEmpty,
    emptyMessage = "No data found.",
    loadingMessage,
    children,
}: {
    loading: boolean;
    error: string | null;
    isEmpty?: boolean;
    emptyMessage?: string;
    loadingMessage?: string;
    children: React.ReactNode;
}) {
    if (loading) return <LoadingState message={loadingMessage} />;
    return (
        <>
            {error && <ErrorBanner message={error} />}
            {!error && isEmpty ? <EmptyState message={emptyMessage} /> : !error ? children : null}
        </>
    );
}

/** Shared hook — same loading / error pattern on every admin page */
export function useAdminLoad<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await fetcher());
        } catch {
            setData(null);
            setError("Unable to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        reload();
    }, [reload]);

    return { data, loading, error, reload, setData };
}

/* ─── Primitives ────────────────────────────────────────────────────── */

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
                <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    {title}
                </h1>
                {description && (
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}

export function StatGrid({
    items,
}: {
    items: {
        label: string;
        value: string | number;
        sub?: string;
        accent?: "sky" | "purple" | "green" | "amber" | "rose";
    }[];
}) {
    const accents = {
        sky: { bar: "#0ea5e9", bg: "rgba(14, 165, 233, 0.08)" },
        purple: { bar: "#8b5cf6", bg: "rgba(139, 92, 246, 0.08)" },
        green: { bar: "#10b981", bg: "rgba(16, 185, 129, 0.08)" },
        amber: { bar: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" },
        rose: { bar: "#f43f5e", bg: "rgba(244, 63, 94, 0.08)" },
    };
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {items.map((item) => {
                const a = accents[item.accent ?? "sky"];
                return (
                    <div
                        key={item.label}
                        className="relative rounded-xl px-4 py-4 overflow-hidden"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                    >
                        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: a.bar }} />
                        <div
                            className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-60"
                            style={{ background: a.bg }}
                        />
                        <p className="relative text-2xl font-bold tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
                            {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                        </p>
                        <p className="relative text-xs font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
                            {item.label}
                        </p>
                        {item.sub && (
                            <p className="relative text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {item.sub}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function Panel({
    title,
    subtitle,
    children,
    className = "",
    noPadding = false,
    highlight,
}: {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    highlight?: "sky" | "purple" | "green" | "amber";
}) {
    const barColors = { sky: "#0ea5e9", purple: "#8b5cf6", green: "#10b981", amber: "#f59e0b" };
    return (
        <section
            className={`w-full rounded-xl overflow-hidden ${className}`}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
            {title && (
                <div
                    className="px-5 py-4 relative"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    {highlight && (
                        <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                            style={{ background: barColors[highlight] }}
                        />
                    )}
                    <h2 className="text-sm font-semibold pl-1" style={{ color: "var(--text-primary)" }}>
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs mt-0.5 pl-1" style={{ color: "var(--text-muted)" }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div className={noPadding ? "" : "p-5"}>{children}</div>
        </section>
    );
}

export function DataTable({
    columns,
    children,
}: {
    columns: { label: string; className?: string }[];
    children: React.ReactNode;
}) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm border-collapse table-fixed">
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                        {columns.map((col) => (
                            <th
                                key={col.label || "action"}
                                className={`text-left px-5 py-3 font-medium text-xs uppercase tracking-wide ${col.className ?? ""}`}
                                style={{ color: "var(--text-muted)" }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

export type FunnelRow = {
    label: string;
    users?: number;
    segments?: { label: string; users: number }[];
    accent?: "sky" | "purple" | "green" | "amber";
    index?: number;
};

const FUNNEL_ACCENTS = {
    sky: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
    purple: "linear-gradient(90deg, #7c3aed, #a78bfa)",
    green: "linear-gradient(90deg, #059669, #34d399)",
    amber: "linear-gradient(90deg, #d97706, #fbbf24)",
};

function funnelTotal(row: FunnelRow) {
    return row.users ?? row.segments?.reduce((s, seg) => s + seg.users, 0) ?? 0;
}

export function FunnelChart({
    base,
    rows,
    maxBarWidth = 100,
}: {
    base: number;
    rows: FunnelRow[];
    maxBarWidth?: number;
}) {
    if (rows.length === 0) return <EmptyState message="No funnel data yet." />;
    const denominator = Math.max(base, 1);
    const peak = Math.max(...rows.map(funnelTotal), 1);

    return (
        <div className="space-y-1">
            {rows.map((row, i) => {
                const total = funnelTotal(row);
                const pct = Math.round((total / denominator) * 100);
                const barPct = Math.max((total / peak) * maxBarWidth, total > 0 ? 4 : 0);
                const prev = i > 0 ? funnelTotal(rows[i - 1]) : null;
                const dropOff =
                    prev != null && prev > 0 ? Math.round(((prev - total) / prev) * 100) : null;
                const accent = row.accent ?? "sky";
                const barBg = FUNNEL_ACCENTS[accent];

                return (
                    <div key={`${row.label}-${i}`} className="group">
                        {dropOff != null && dropOff > 0 && (
                            <div className="flex items-center gap-2 py-1 pl-8">
                                <div className="w-px h-3" style={{ background: "var(--border)" }} />
                                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                                    −{dropOff}% drop-off
                                </span>
                            </div>
                        )}
                        <div
                            className="rounded-lg px-3 py-2.5 transition-colors"
                            style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-secondary)" }}
                        >
                            <div className="flex items-start gap-3">
                                {row.index != null && (
                                    <span
                                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums"
                                        style={{
                                            background: `${accent === "purple" ? "rgba(139,92,246,0.15)" : accent === "green" ? "rgba(16,185,129,0.15)" : accent === "amber" ? "rgba(245,158,11,0.15)" : "rgba(14,165,233,0.15)"}`,
                                            color: accent === "purple" ? "#a78bfa" : accent === "green" ? "#34d399" : accent === "amber" ? "#fbbf24" : "#38bdf8",
                                        }}
                                    >
                                        {row.index}
                                    </span>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <span className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                                            {row.label.replace(/^\d+\.\s*/, "")}
                                        </span>
                                        <div className="shrink-0 text-right">
                                            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                                                {total.toLocaleString()}
                                            </span>
                                            <span className="text-xs ml-1.5 tabular-nums" style={{ color: "var(--text-muted)" }}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="h-2 rounded-full overflow-hidden"
                                        style={{ background: "var(--bg-secondary)" }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${barPct}%`, background: barBg }}
                                        />
                                    </div>
                                    {row.segments && row.segments.length > 0 && (
                                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                                            {row.segments.map((seg) => (
                                                <span
                                                    key={seg.label}
                                                    className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
                                                    style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                                                >
                                                    {seg.label}
                                                    <strong className="tabular-nums" style={{ color: "var(--text-primary)" }}>
                                                        {seg.users.toLocaleString()}
                                                    </strong>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function FunnelList({ base, rows }: { base: number; rows: FunnelRow[] }) {
    return <FunnelChart base={base} rows={rows} />;
}

export function ProgressBarList({
    items,
    total,
}: {
    items: { label: string; value: number; color: string }[];
    total?: number;
}) {
    const denom = total ?? Math.max(...items.map((i) => i.value), 1);
    return (
        <div className="space-y-4">
            {items.map((item) => {
                const pct = Math.round((item.value / denom) * 100);
                return (
                    <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                            <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                            <span className="tabular-nums font-semibold" style={{ color: "var(--text-primary)" }}>
                                {item.value.toLocaleString()}
                                <span className="text-xs font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                                    {pct}%
                                </span>
                            </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%`, background: item.color }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function QuickNavGrid({
    items,
}: {
    items: { title: string; desc: string; href: string; stat: string; color: string }[];
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {items.map((item) => (
                <Link
                    key={item.title}
                    href={item.href}
                    className="group rounded-xl p-4 transition-all hover:shadow-md"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${item.color}18`, color: item.color }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md tabular-nums" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                            {item.stat}
                        </span>
                    </div>
                    <p className="text-sm font-semibold mt-3 group-hover:underline" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {item.desc}
                    </p>
                </Link>
            ))}
        </div>
    );
}

export function LoadingState({ message = "Loading…" }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div
                className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{message}</p>
        </div>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
            {message}
        </p>
    );
}

export function ErrorBanner({ message }: { message: string }) {
    return (
        <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.25)",
            }}
        >
            {message}
        </div>
    );
}

export function PaginationBar({
    page,
    totalPages,
    onPrev,
    onNext,
    disabled,
}: {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    disabled?: boolean;
}) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-muted)" }}>
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
                <button disabled={disabled || page === 1} onClick={onPrev}
                    className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
                    Previous
                </button>
                <button disabled={disabled || page === totalPages} onClick={onNext}
                    className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
                    Next
                </button>
            </div>
        </div>
    );
}

export function UserLink({
    userId,
    name,
    email,
    guest,
}: {
    userId: string;
    name?: string;
    email?: string;
    guest?: boolean;
}) {
    return (
        <Link
            href={`/dashboard/users/${userId}`}
            className="block min-w-0 hover:underline"
            style={{ color: "var(--text-primary)" }}
            onClick={(e) => e.stopPropagation()}
        >
            <span className="text-sm font-medium block truncate">{guest ? "Guest" : (name || "Unknown")}</span>
            <span className="text-xs block truncate" style={{ color: "var(--text-muted)" }}>
                {email || userId.slice(0, 8)}
            </span>
        </Link>
    );
}

const BILLING_LABELS: Record<string, string> = {
    free: "Free",
    weekly: "Weekly",
    monthly: "Monthly",
    annual: "Annual",
    lifetime: "Lifetime",
};

export function formatBillingCycle(cycle?: string | null) {
    if (!cycle) return "—";
    return BILLING_LABELS[cycle.toLowerCase()] ?? cycle;
}

export function Badge({
    children,
    tone = "neutral",
    size = "sm",
}: {
    children: React.ReactNode;
    tone?: "neutral" | "success" | "warning" | "purple" | "sky";
    size?: "sm" | "md";
}) {
    const tones = {
        neutral: { bg: "var(--bg-secondary)", color: "var(--text-secondary)" },
        success: { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" },
        warning: { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
        purple: { bg: "rgba(139, 92, 246, 0.15)", color: "#a78bfa" },
        sky: { bg: "rgba(14, 165, 233, 0.15)", color: "#38bdf8" },
    };
    const t = tones[tone];
    const sizeClass = size === "md" ? "px-2.5 py-1 text-sm font-semibold" : "px-2 py-0.5 text-xs font-medium";
    return (
        <span
            className={`inline-flex items-center rounded-md whitespace-nowrap ${sizeClass}`}
            style={{ background: t.bg, color: t.color }}
        >
            {children}
        </span>
    );
}

export const SELECT_CLASS =
    "px-3 py-2 rounded-lg text-sm focus:outline-none w-full sm:w-auto bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]";

export function tableRowClass() {
    return "hover:bg-[var(--bg-secondary)]/50";
}

export function tableCellClass() {
    return "px-5 py-3.5 align-middle";
}

export function tableRowBorder() {
    return { borderBottom: "1px solid var(--border)" } as const;
}
