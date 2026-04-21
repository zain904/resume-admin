"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type FunnelStep = {
    key: string;
    label: string;
    users: number;
};

type FunnelResponse = {
    totalStarted?: number;
    totalCompleted?: number;
    avgCompletionMinutes?: number;
    steps?: Array<{ key?: string; label?: string; users?: number }>;
};

const defaultSteps: FunnelStep[] = [
    { key: "start", label: "Opened Onboarding", users: 0 },
    { key: "intro_cta", label: "Clicked Intro CTA", users: 0 },
    { key: "template_selected", label: "Selected Template", users: 0 },
    { key: "form_submitted", label: "Submitted Form", users: 0 },
    { key: "preview_shown", label: "Viewed Resume Preview", users: 0 },
    { key: "completed", label: "Completed Onboarding", users: 0 },
];

export default function OnboardingFunnelPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [steps, setSteps] = useState<FunnelStep[]>(defaultSteps);
    const [totalStarted, setTotalStarted] = useState(0);
    const [totalCompleted, setTotalCompleted] = useState(0);
    const [avgCompletionMinutes, setAvgCompletionMinutes] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get("/admin/onboardingFunnel");
                const data: FunnelResponse = res?.data?.data || {};

                const apiSteps = (data.steps || []).map((s) => ({
                    key: s.key || "",
                    label: s.label || "Step",
                    users: Number(s.users || 0),
                }));

                if (apiSteps.length > 0) {
                    setSteps(apiSteps);
                }
                setTotalStarted(Number(data.totalStarted || apiSteps[0]?.users || 0));
                setTotalCompleted(Number(data.totalCompleted || apiSteps[apiSteps.length - 1]?.users || 0));
                setAvgCompletionMinutes(
                    typeof data.avgCompletionMinutes === "number" ? data.avgCompletionMinutes : null
                );
            } catch {
                setError(
                    "Could not load onboarding funnel yet. Make sure backend exposes /admin/onboardingFunnel."
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const startCount = useMemo(() => Math.max(steps[0]?.users || totalStarted || 0, 1), [steps, totalStarted]);
    const completionRate = useMemo(
        () => Math.round(((totalCompleted || steps[steps.length - 1]?.users || 0) / startCount) * 100),
        [steps, totalCompleted, startCount]
    );

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Loading onboarding funnel...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Onboarding Conversion Funnel
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Track how many users move through each onboarding step and where they drop off.
                </p>

                {error && (
                    <div className="mt-4 text-sm rounded-xl px-4 py-3 bg-amber-50 text-amber-700 border border-amber-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Started
                        </p>
                        <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                            {totalStarted.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Completed
                        </p>
                        <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                            {totalCompleted.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Completion Rate
                        </p>
                        <p className="text-2xl font-black mt-1 text-emerald-500">
                            {Number.isFinite(completionRate) ? completionRate : 0}%
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            Avg. time: {avgCompletionMinutes != null ? `${avgCompletionMinutes.toFixed(1)} min` : "N/A"}
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
                        const pctOfStart = Math.round((users / startCount) * 100);
                        const prev = index === 0 ? users : (steps[index - 1]?.users || 0);
                        const fromPrevPct = prev > 0 ? Math.round((users / prev) * 100) : 0;
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
                                        className="h-full rounded-full bg-linear-to-r from-[#6366f1] to-[#22d3ee]"
                                        style={{ width: `${Math.max(pctOfStart, 2)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                    <span>{pctOfStart}% of onboarding starts</span>
                                    <span>{index === 0 ? "Entry step" : `${fromPrevPct}% from previous step`}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
