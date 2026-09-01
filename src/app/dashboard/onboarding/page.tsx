"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
    FunnelChart,
    FunnelRow,
    PageContent,
    PageHeader,
    PageShell,
    Panel,
    StatGrid,
} from "@/components/admin/AdminUI";

type Segment = { key: string; label: string; users: number };
type Step = { key: string; label: string; users?: number; segments?: Segment[]; index?: number };
type DetailRow = { key: string; label: string; users: number };

type OnboardingV2 = {
    totalStarted: number;
    flowBreakdown?: {
        careerGoalStarted: number;
        legacyStarted: number;
        careerGoalFinished: number;
    };
    endings?: { leftViaSignIn: number; finalAction: number };
    main: Step[];
    jobPrefsDetail: DetailRow[];
    buildMethodDetail: {
        screen: DetailRow;
        selected: { label: string; segments: Segment[] };
        quickAi: DetailRow[];
        linkedin: DetailRow[];
        upload: DetailRow[];
    };
    editBranch: {
        cohortSize: number;
        steps: Step[];
        savePromptShown: DetailRow;
        signInOutcomes: { label: string; segments: Segment[] };
        finalActions: { label: string; segments: Segment[] };
    };
};

type ExtraStep = { label: string; users: number };

const EXTRA_KEYS = new Set([
    "trial_modal_shown",
    "trial_modal_start_clicked",
    "trial_modal_started_success",
    "trial_modal_skipped",
    "completed",
    "job_alert_prompt",
    "job_alert_notif_granted",
    "job_alert_notif_denied",
]);

function stepAccent(key: string): FunnelRow["accent"] {
    if (key.startsWith("cg_") || key === "onboarding_started") return "purple";
    if (key === "preview_action" || key.startsWith("final")) return "green";
    if (key === "notif_choice" || key.includes("job_prefs")) return "amber";
    return "sky";
}

function toChartRows(steps: Step[]): FunnelRow[] {
    return steps.map((s) => ({
        index: s.index,
        label: s.label,
        users: s.users,
        accent: stepAccent(s.key),
        segments: s.segments?.map((seg) => ({ label: seg.label, users: seg.users })),
    }));
}

function detailToRows(rows: DetailRow[], accent: FunnelRow["accent"] = "sky"): FunnelRow[] {
    return rows.map((r) => ({ label: r.label, users: r.users, accent }));
}

export default function OnboardingFunnelPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<OnboardingV2 | null>(null);
    const [extraSteps, setExtraSteps] = useState<ExtraStep[]>([]);
    const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const v2Res = await api.get("/admin/onboardingFunnelV2");
            const v2Data = v2Res?.data?.data;
            if (!v2Data?.main) {
                setError("Onboarding data is empty.");
                setData(null);
                return;
            }
            setData(v2Data);

            try {
                const v1Res = await api.get("/admin/onboardingFunnel");
                const v1Steps: { key: string; label: string; users: number }[] = v1Res?.data?.data?.steps ?? [];
                const v2Keys = new Set(
                    (v2Data.main ?? []).flatMap((s: Step) => [s.key, ...(s.segments?.map((x) => x.key) ?? [])])
                );
                setExtraSteps(
                    v1Steps
                        .filter((s) => !v2Keys.has(s.key) && EXTRA_KEYS.has(s.key))
                        .map((s) => ({ label: s.label, users: s.users }))
                );
            } catch {
                setExtraSteps([]);
            }
        } catch {
            setData(null);
            setError("Unable to load onboarding funnel.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const base = Math.max(data?.totalStarted ?? 0, 1);
    const editBase = Math.max(data?.editBranch?.cohortSize ?? 0, 1);
    const cgStarted = data?.flowBreakdown?.careerGoalStarted ?? 0;
    const reviewRate = data ? Math.round((data.editBranch.cohortSize / base) * 100) : 0;
    const cgFinishRate = cgStarted > 0
        ? Math.round(((data?.flowBreakdown?.careerGoalFinished ?? 0) / cgStarted) * 100)
        : 0;

    const mainRows = useMemo(() => (data ? toChartRows(data.main) : []), [data]);
    const careerGoalRows = useMemo(
        () => mainRows.filter((r) => r.index != null && r.index <= 8),
        [mainRows]
    );
    const legacyRows = useMemo(
        () => mainRows.filter((r) => r.index != null && r.index > 8),
        [mainRows]
    );

    const buildRows = useMemo((): FunnelRow[] => {
        if (!data) return [];
        const d = data.buildMethodDetail;
        return [
            { label: d.screen.label, users: d.screen.users, accent: "sky" },
            {
                label: d.selected.label,
                accent: "sky",
                segments: d.selected.segments.map((s) => ({ label: s.label, users: s.users })),
            },
            ...d.quickAi.map((r) => ({ label: `Quick AI — ${r.label}`, users: r.users, accent: "sky" as const })),
            ...d.linkedin.map((r) => ({ label: `LinkedIn — ${r.label}`, users: r.users, accent: "sky" as const })),
            ...d.upload.map((r) => ({ label: `Upload — ${r.label}`, users: r.users, accent: "sky" as const })),
        ];
    }, [data]);

    const editRows = useMemo((): FunnelRow[] => {
        if (!data) return [];
        const b = data.editBranch;
        return [
            ...toChartRows(b.steps).map((r) => ({ ...r, accent: "green" as const })),
            { label: b.savePromptShown.label, users: b.savePromptShown.users, accent: "green" },
            {
                label: b.signInOutcomes.label,
                accent: "green",
                segments: b.signInOutcomes.segments.map((s) => ({ label: s.label, users: s.users })),
            },
            {
                label: b.finalActions.label,
                accent: "green",
                segments: b.finalActions.segments.map((s) => ({ label: s.label, users: s.users })),
            },
        ];
    }, [data]);

    return (
        <PageShell>
            <PageHeader
                title="Onboarding Funnel"
                description="Track user conversion from first open through career goal quiz to resume download."
                action={
                    <button
                        onClick={load}
                        disabled={loading}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Refresh
                    </button>
                }
            />

            <PageContent
                loading={loading}
                error={error}
                isEmpty={!data}
                emptyMessage="No onboarding data yet."
                loadingMessage="Loading funnel data…"
            >
                {data && (
                    <>
                        {/* Hero conversion strip */}
                        <div
                            className="rounded-xl p-5 lg:p-6 relative overflow-hidden"
                            style={{
                                background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(14,165,233,0.08) 50%, rgba(16,185,129,0.06) 100%)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                                        Overall conversion
                                    </p>
                                    <p className="text-4xl font-bold tabular-nums mt-1" style={{ color: "var(--text-primary)" }}>
                                        {reviewRate}%
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                                        {data.editBranch.cohortSize.toLocaleString()} reached review & download
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                                        Career goal completion
                                    </p>
                                    <p className="text-4xl font-bold tabular-nums mt-1" style={{ color: "#a78bfa" }}>
                                        {cgFinishRate}%
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                                        {data.flowBreakdown?.careerGoalFinished?.toLocaleString() ?? 0} finished the quiz
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                                        Final actions
                                    </p>
                                    <p className="text-4xl font-bold tabular-nums mt-1" style={{ color: "#34d399" }}>
                                        {data.endings?.finalAction?.toLocaleString() ?? 0}
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                                        Share, download, or close after preview
                                    </p>
                                </div>
                            </div>
                        </div>

                        <StatGrid
                            items={[
                                { label: "Total started", value: data.totalStarted, sub: "New + legacy combined", accent: "sky" },
                                { label: "Career goal (new)", value: cgStarted, sub: "New app build", accent: "purple" },
                                { label: "Legacy flow", value: data.flowBreakdown?.legacyStarted ?? 0, sub: "Older onboarding path", accent: "amber" },
                                { label: "Final action", value: data.endings?.finalAction ?? 0, sub: "Completed preview step", accent: "green" },
                            ]}
                        />

                        {/* Tab switcher */}
                        <div
                            className="inline-flex p-1 rounded-lg"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                        >
                            {(["overview", "details"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className="px-4 py-2 rounded-md text-sm font-medium capitalize transition-all"
                                    style={{
                                        background: activeTab === tab ? "var(--accent)" : "transparent",
                                        color: activeTab === tab ? "#fff" : "var(--text-muted)",
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === "overview" ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
                                <Panel
                                    title="Career goal quiz"
                                    subtitle="New onboarding path — steps 1–8"
                                    highlight="purple"
                                    className="xl:col-span-2"
                                >
                                    <FunnelChart base={base} rows={careerGoalRows} />
                                </Panel>

                                <Panel
                                    title="Resume build (legacy path)"
                                    subtitle="Template selection through review — steps 9–17"
                                    highlight="sky"
                                    className="xl:col-span-2"
                                >
                                    <FunnelChart base={base} rows={legacyRows} />
                                </Panel>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
                                <Panel title="Job preferences" subtitle="Preference sheet detail events" highlight="amber">
                                    <FunnelChart base={base} rows={detailToRows(data.jobPrefsDetail, "amber")} />
                                </Panel>

                                <Panel title="Build method" subtitle="Quick AI, LinkedIn, or upload" highlight="sky">
                                    <FunnelChart base={base} rows={buildRows} />
                                </Panel>

                                <Panel
                                    title="Edit profile & download"
                                    subtitle={`${data.editBranch.cohortSize.toLocaleString()} users in this cohort`}
                                    highlight="green"
                                    className="xl:col-span-2"
                                >
                                    <FunnelChart base={editBase} rows={editRows} />
                                </Panel>

                                {extraSteps.length > 0 && (
                                    <Panel title="Trial & completion" subtitle="Extra events from legacy tracking" className="xl:col-span-2">
                                        <FunnelChart
                                            base={base}
                                            rows={extraSteps.map((s) => ({ label: s.label, users: s.users, accent: "amber" as const }))}
                                        />
                                    </Panel>
                                )}
                            </div>
                        )}

                        {/* Legend */}
                        <div
                            className="flex flex-wrap gap-4 px-4 py-3 rounded-lg text-xs"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                        >
                            <span className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                                <span className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }} />
                                Career goal (new)
                            </span>
                            <span className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                                <span className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(90deg, #0ea5e9, #38bdf8)" }} />
                                Legacy resume build
                            </span>
                            <span className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                                <span className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(90deg, #059669, #34d399)" }} />
                                Edit & download
                            </span>
                            <span className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                                <span className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(90deg, #d97706, #fbbf24)" }} />
                                Job preferences
                            </span>
                        </div>
                    </>
                )}
            </PageContent>
        </PageShell>
    );
}
