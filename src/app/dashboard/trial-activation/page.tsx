"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type FunnelStep = {
    key: string;
    label: string;
    eventName?: string;
    users: number;
};

type ContextRow = {
    context: string;
    users: number;
};

type FunnelResponse = {
    contextFilter?: string | null;
    steps?: Array<{ key?: string; label?: string; eventName?: string; users?: number }>;
    contextBreakdown?: ContextRow[];
    wallToActivationRate?: number | null;
};

const defaultSteps: FunnelStep[] = [
    { key: "shown", label: "Saw Trial Modal", users: 0 },
    { key: "grace_started", label: "Started 3-Day Grace (First Skip)", users: 0 },
    { key: "skipped", label: "Skipped (Total Dismissals)", users: 0 },
    { key: "grace_expired", label: "Hit Mandatory Wall (Grace Expired)", users: 0 },
    { key: "start_clicked", label: "Clicked Start Free Trial", users: 0 },
    { key: "activated", label: "Trial Activated", users: 0 },
];

// Friendly labels for the surfaces the modal can be shown on. Falls back
// to the raw stepKey if a new context shows up before we add a label here.
const CONTEXT_LABELS: Record<string, string> = {
    create_profile_first_visit: "Create / Edit Profile (First Visit)",
    create_profile_guest: "Create / Edit Profile (Guest)",
    ai_tab_gate: "AI Tab Gate",
    jobs_tab_after_preferences: "Jobs Tab (After Preferences)",
    onboarding_trial: "Onboarding (Legacy)",
};

const CONTEXT_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
    { value: "", label: "All surfaces" },
    { value: "create_profile_first_visit", label: "Create / Edit Profile (First Visit)" },
    { value: "ai_tab_gate", label: "AI Tab Gate" },
    { value: "jobs_tab_after_preferences", label: "Jobs Tab (After Preferences)" },
];

export default function TrialActivationFunnelPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [steps, setSteps] = useState<FunnelStep[]>(defaultSteps);
    const [contextBreakdown, setContextBreakdown] = useState<ContextRow[]>([]);
    const [wallToActivationRate, setWallToActivationRate] = useState<number | null>(null);
    const [contextFilter, setContextFilter] = useState<string>("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = contextFilter
                    ? `/admin/trialActivationFunnel?context=${encodeURIComponent(contextFilter)}`
                    : "/admin/trialActivationFunnel";
                const res = await api.get(url);
                const data: FunnelResponse = res?.data?.data || {};

                const apiSteps = (data.steps || []).map((s) => ({
                    key: s.key || "",
                    label: s.label || "Step",
                    eventName: s.eventName,
                    users: Number(s.users || 0),
                }));

                if (apiSteps.length > 0) {
                    setSteps(apiSteps);
                }
                setContextBreakdown(data.contextBreakdown || []);
                setWallToActivationRate(
                    typeof data.wallToActivationRate === "number"
                        ? data.wallToActivationRate
                        : null
                );
            } catch {
                setError(
                    "Could not load trial activation funnel. Make sure the backend exposes /admin/trialActivationFunnel."
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [contextFilter]);

    // The "shown" step is the entry point. Every later step's % is
    // calculated against this — both as a global drop-off measure and as
    // a step-from-step delta.
    const shownCount = useMemo(
        () => Math.max(steps.find((s) => s.key === "shown")?.users || 0, 1),
        [steps]
    );

    const overallActivationRate = useMemo(() => {
        const activated = steps.find((s) => s.key === "activated")?.users || 0;
        return Math.round((activated / shownCount) * 100);
    }, [steps, shownCount]);

    const skipRate = useMemo(() => {
        const skipped = steps.find((s) => s.key === "skipped")?.users || 0;
        return Math.round((skipped / shownCount) * 100);
    }, [steps, shownCount]);

    const totalContextUsers = useMemo(
        () => contextBreakdown.reduce((sum, c) => sum + c.users, 0),
        [contextBreakdown]
    );

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Loading trial activation funnel...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                            Trial Activation Funnel
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                            Tracks the 3-day skip grace window: how many users skip, how many hit the
                            mandatory wall, and how many ultimately convert into a free trial.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Surface
                        </label>
                        <select
                            value={contextFilter}
                            onChange={(e) => setContextFilter(e.target.value)}
                            className="text-sm rounded-lg px-3 py-1.5 border"
                            style={{
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                borderColor: "var(--border)",
                            }}
                        >
                            {CONTEXT_FILTER_OPTIONS.map((opt) => (
                                <option key={opt.value || "all"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 text-sm rounded-xl px-4 py-3 bg-amber-50 text-amber-700 border border-amber-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Modal Impressions
                        </p>
                        <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                            {(steps.find((s) => s.key === "shown")?.users || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Skip Rate
                        </p>
                        <p className="text-2xl font-black mt-1 text-amber-500">{skipRate}%</p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            {(steps.find((s) => s.key === "skipped")?.users || 0).toLocaleString()} of {shownCount.toLocaleString()} dismissed
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Trial Activation Rate
                        </p>
                        <p className="text-2xl font-black mt-1 text-emerald-500">
                            {Number.isFinite(overallActivationRate) ? overallActivationRate : 0}%
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            of users who saw the modal
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Wall → Activation
                        </p>
                        <p className="text-2xl font-black mt-1 text-indigo-500">
                            {wallToActivationRate != null ? `${wallToActivationRate}%` : "—"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            after 3-day grace expires
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    Step-by-Step Flow
                </h2>
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const users = step.users || 0;
                        const pctOfStart = Math.round((users / shownCount) * 100);
                        const prev = index === 0 ? users : (steps[index - 1]?.users || 0);
                        const fromPrevPct = prev > 0 ? Math.round((users / prev) * 100) : 0;
                        const isWall = step.key === "grace_expired";
                        const isWin = step.key === "activated";
                        return (
                            <div key={`${step.key}-${index}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {index + 1}. {step.label}
                                    </p>
                                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        {users.toLocaleString()} users
                                    </div>
                                </div>
                                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                    <div
                                        className={
                                            isWin
                                                ? "h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600"
                                                : isWall
                                                    ? "h-full rounded-full bg-linear-to-r from-rose-400 to-rose-600"
                                                    : "h-full rounded-full bg-linear-to-r from-[#6366f1] to-[#22d3ee]"
                                        }
                                        style={{ width: `${Math.max(pctOfStart, 2)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                    <span>{pctOfStart}% of modal impressions</span>
                                    <span>{index === 0 ? "Entry step" : `${fromPrevPct}% from previous step`}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {contextBreakdown.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                        Where Users First See the Modal
                    </h2>
                    <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                        Distinct user count per surface, across all `trial_modal_shown` impressions.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contextBreakdown.map((row) => {
                            const label = CONTEXT_LABELS[row.context] || row.context;
                            const share = totalContextUsers > 0
                                ? Math.round((row.users / totalContextUsers) * 100)
                                : 0;
                            return (
                                <div
                                    key={row.context}
                                    className="rounded-xl p-4"
                                    style={{ background: "var(--bg-secondary)" }}
                                >
                                    <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                        {label}
                                    </p>
                                    <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                                        {row.users.toLocaleString()}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                        {share}% of total
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
