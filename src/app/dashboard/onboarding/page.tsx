"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

// ---------------------------------------------------------------------------
// Payload shape returned by GET /admin/onboardingFunnelV2
// Mirror of the backend `getOnboardingFunnelV2` controller so a
// backend-only tweak (adding a step / segment) shows up here as a
// compile error instead of a silent empty row.
// ---------------------------------------------------------------------------
type Segment = {
    key: string;
    label: string;
    users: number;
};

type MainStep = {
    index: number;
    key: string;
    label: string;
    users?: number;
    segments?: Segment[];
};

type EditStep = {
    index: number;
    key: string;
    label: string;
    users: number;
};

type SegmentedBlock = {
    key: string;
    label: string;
    segments: Segment[];
};

type FunnelV2Response = {
    totalStarted: number;
    endings: {
        leftViaSignIn: number;
        finalAction: number;
    };
    main: MainStep[];
    editBranch: {
        cohortSize: number;
        steps: EditStep[];
        savePromptShown: { key: string; label: string; users: number };
        signInOutcomes: SegmentedBlock;
        finalActions: SegmentedBlock;
    };
};

// Color palette for segments. Each segment gets a stable color so the
// same label always renders in the same shade across refreshes.
const SEGMENT_COLORS = [
    "#6366f1", // indigo
    "#22d3ee", // cyan
    "#f59e0b", // amber
    "#10b981", // emerald
    "#ef4444", // red
    "#a855f7", // purple
];

function segmentColor(index: number): string {
    return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
}

function pct(n: number, denom: number): number {
    if (!denom || denom <= 0) return 0;
    return Math.round((n / denom) * 100);
}

// ---------------------------------------------------------------------------
// Re-usable bits
// ---------------------------------------------------------------------------
function KpiTile({
    title,
    value,
    hint,
    accent,
}: {
    title: string;
    value: number;
    hint?: string;
    accent?: string;
}) {
    return (
        <div
            className="rounded-xl p-4"
            style={{ background: "var(--bg-secondary)" }}
        >
            <p
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
            >
                {title}
            </p>
            <p
                className="text-2xl font-black mt-1"
                style={{ color: accent || "var(--text-primary)" }}
            >
                {value.toLocaleString()}
            </p>
            {hint ? (
                <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

function SingleBarRow({
    label,
    users,
    widthPct,
    stepNumber,
    fromPrevPct,
    denominatorLabel,
}: {
    label: string;
    users: number;
    widthPct: number;
    stepNumber?: string;
    fromPrevPct?: number | null;
    denominatorLabel: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                >
                    {stepNumber ? `${stepNumber}. ` : ""}
                    {label}
                </p>
                <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                >
                    {users.toLocaleString()} users
                </div>
            </div>
            <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-secondary)" }}
            >
                <div
                    className="h-full rounded-full bg-linear-to-r from-[#6366f1] to-[#22d3ee]"
                    style={{ width: `${Math.max(widthPct, 2)}%` }}
                />
            </div>
            <div
                className="flex items-center justify-between mt-1.5 text-xs"
                style={{ color: "var(--text-muted)" }}
            >
                <span>
                    {widthPct}% {denominatorLabel}
                </span>
                {fromPrevPct != null ? (
                    <span>{fromPrevPct}% from previous step</span>
                ) : null}
            </div>
        </div>
    );
}

function SegmentedBarRow({
    label,
    segments,
    stepNumber,
    denominator,
    denominatorLabel,
}: {
    label: string;
    segments: Segment[];
    stepNumber?: string;
    denominator: number;
    denominatorLabel: string;
}) {
    const total = segments.reduce((sum, s) => sum + (s.users || 0), 0);
    const barDenom = Math.max(total, 1);

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                >
                    {stepNumber ? `${stepNumber}. ` : ""}
                    {label}
                </p>
                <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                >
                    {total.toLocaleString()} users
                </div>
            </div>
            <div
                className="h-2.5 rounded-full overflow-hidden flex"
                style={{ background: "var(--bg-secondary)" }}
            >
                {segments.map((seg, i) => {
                    const widthPct = (seg.users / barDenom) * 100;
                    return (
                        <div
                            key={seg.key}
                            className="h-full"
                            style={{
                                width: `${widthPct}%`,
                                background: segmentColor(i),
                            }}
                            title={`${seg.label}: ${seg.users.toLocaleString()}`}
                        />
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs">
                {segments.map((seg, i) => (
                    <span
                        key={`${seg.key}-legend`}
                        className="inline-flex items-center gap-1.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-sm"
                            style={{ background: segmentColor(i) }}
                        />
                        {seg.label}: {seg.users.toLocaleString()}{" "}
                        {denominator > 0
                            ? `(${pct(seg.users, denominator)}% ${denominatorLabel})`
                            : ""}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OnboardingFunnelPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<FunnelV2Response | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get("/admin/onboardingFunnelV2");
                const body = res?.data?.data as FunnelV2Response | undefined;
                if (!body) {
                    throw new Error("Empty response");
                }
                setData(body);
            } catch {
                setError(
                    "Could not load the onboarding funnel. Make sure the backend exposes /admin/onboardingFunnelV2.",
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Denominator for the main flow: total users who started onboarding.
    // We clamp to 1 so divide-by-zero doesn't blow up the bar widths.
    const startCount = useMemo(() => {
        const firstStep = data?.main?.[0];
        const fromStep = firstStep?.users ?? 0;
        return Math.max(data?.totalStarted ?? fromStep, 1);
    }, [data]);

    const editCohortSize = useMemo(() => {
        return Math.max(data?.editBranch?.cohortSize ?? 0, 1);
    }, [data]);

    // We only show the "from previous step" footnote on single-count
    // steps — segmented steps don't have a single number to compare.
    const prevUsersForStep = useMemo(() => {
        const map: Record<number, number> = {};
        if (!data?.main) return map;
        let prev = 0;
        for (const step of data.main) {
            const thisCount =
                step.users ??
                (step.segments
                    ? step.segments.reduce((s, seg) => s + (seg.users || 0), 0)
                    : 0);
            map[step.index] = prev;
            prev = thisCount;
        }
        return map;
    }, [data]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted)" }}
                >
                    Loading onboarding funnel...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header + 3 KPI tiles for the funnel's three ending points. */}
            <div
                className="rounded-2xl p-6"
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                }}
            >
                <h1
                    className="text-xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                >
                    Onboarding Funnel
                </h1>
                <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    Single-funnel view of the full onboarding journey with
                    two ending points: users who leave via the{" "}
                    <span className="font-semibold">Sign-in</span> dialog
                    inside Review &amp; Download, and users whose last
                    action is{" "}
                    <span className="font-semibold">share / download / close</span>
                    {" "}on the final resume.
                </p>

                {error && (
                    <div className="mt-4 text-sm rounded-xl px-4 py-3 bg-amber-50 text-amber-700 border border-amber-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <KpiTile
                        title="End 1 · Left via sign-in"
                        value={data?.endings.leftViaSignIn ?? 0}
                        hint={`${pct(data?.endings.leftViaSignIn ?? 0, editCohortSize)}% of Review & Download cohort`}
                        accent="#f59e0b"
                    />
                    <KpiTile
                        title="End 2 · Final action (share/download/close)"
                        value={data?.endings.finalAction ?? 0}
                        hint={`${pct(data?.endings.finalAction ?? 0, editCohortSize)}% of Review & Download cohort`}
                        accent="#6366f1"
                    />
                </div>
            </div>

            {/* Section A — main flow, steps 1-10. */}
            <div
                className="rounded-2xl p-6"
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                }}
            >
                <div className="flex items-baseline justify-between mb-4">
                    <h2
                        className="text-base font-bold"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Main flow (all users)
                    </h2>
                    <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {startCount.toLocaleString()} onboarding starts ·
                        bar widths are relative to this denominator
                    </p>
                </div>

                <div className="space-y-4">
                    {(data?.main || []).map((step) => {
                        const stepNumber = `${step.index}`;
                        if (step.segments && step.segments.length > 0) {
                            return (
                                <SegmentedBarRow
                                    key={step.key}
                                    stepNumber={stepNumber}
                                    label={step.label}
                                    segments={step.segments}
                                    denominator={startCount}
                                    denominatorLabel="of onboarding starts"
                                />
                            );
                        }
                        const users = step.users ?? 0;
                        const prev = prevUsersForStep[step.index] ?? 0;
                        const fromPrev =
                            prev > 0 ? Math.round((users / prev) * 100) : null;
                        return (
                            <SingleBarRow
                                key={step.key}
                                stepNumber={stepNumber}
                                label={step.label}
                                users={users}
                                widthPct={pct(users, startCount)}
                                fromPrevPct={fromPrev}
                                denominatorLabel="of onboarding starts"
                            />
                        );
                    })}
                </div>
            </div>

            {/* Section B — Review-and-Download branch (formerly edit-my-details). */}
            <div
                className="rounded-2xl p-6"
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                }}
            >
                <div className="flex items-baseline justify-between mb-4">
                    <h2
                        className="text-base font-bold"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Review &amp; Download branch
                    </h2>
                    <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {(data?.editBranch?.cohortSize ?? 0).toLocaleString()}{" "}
                        users in cohort · bar widths relative to cohort size
                    </p>
                </div>

                <div className="space-y-4">
                    {(data?.editBranch?.steps || []).map((step) => {
                        const stepLabel = `12.${step.index}`;
                        return (
                            <SingleBarRow
                                key={step.key}
                                stepNumber={stepLabel}
                                label={step.label}
                                users={step.users}
                                widthPct={pct(step.users, editCohortSize)}
                                denominatorLabel="of edit-details cohort"
                            />
                        );
                    })}

                    {data?.editBranch?.savePromptShown ? (
                        <SingleBarRow
                            stepNumber="13"
                            label={data.editBranch.savePromptShown.label}
                            users={data.editBranch.savePromptShown.users}
                            widthPct={pct(
                                data.editBranch.savePromptShown.users,
                                editCohortSize,
                            )}
                            denominatorLabel="of edit-details cohort"
                        />
                    ) : null}

                    {data?.editBranch?.signInOutcomes ? (
                        <SegmentedBarRow
                            stepNumber="14"
                            label={data.editBranch.signInOutcomes.label}
                            segments={data.editBranch.signInOutcomes.segments}
                            denominator={
                                data.editBranch.savePromptShown?.users ||
                                editCohortSize
                            }
                            denominatorLabel="of save-prompt shown"
                        />
                    ) : null}

                    {data?.editBranch?.finalActions ? (
                        <SegmentedBarRow
                            stepNumber="16"
                            label={data.editBranch.finalActions.label}
                            segments={data.editBranch.finalActions.segments}
                            denominator={editCohortSize}
                            denominatorLabel="of edit-details cohort"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
