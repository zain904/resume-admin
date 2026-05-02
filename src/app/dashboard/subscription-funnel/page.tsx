"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type FunnelStep = {
    key: string;
    label: string;
    eventName?: string;
    users: number;
    events: number;
};

type BillingMix = {
    monthly: number;
    annual: number;
    lifetime: number;
};

type FailureRow = {
    reason: string;
    count: number;
};

type FunnelResponse = {
    steps?: Array<{ key?: string; label?: string; eventName?: string; users?: number; events?: number }>;
    pickerToTrialRate?: number | null;
    pickerToPaidRate?: number | null;
    billingMix?: BillingMix;
    failureBreakdown?: FailureRow[];
    totals?: {
        pickerShown?: number;
        trialActivated?: number;
        paidPurchased?: number;
        attemptFailed?: number;
    };
};

const defaultSteps: FunnelStep[] = [
    { key: "picker_shown", label: "Plan Picker Shown", users: 0, events: 0 },
    { key: "picker_continue", label: "Clicked Continue on Picker", users: 0, events: 0 },
    { key: "trial_activated", label: "Trial Activated (Confirmed)", users: 0, events: 0 },
    { key: "purchased", label: "Paid Subscription Purchased", users: 0, events: 0 },
    { key: "purchased_monthly", label: "Monthly Purchased", users: 0, events: 0 },
    { key: "purchased_annual", label: "Annual Purchased", users: 0, events: 0 },
    { key: "purchased_lifetime", label: "Lifetime Purchased", users: 0, events: 0 },
    { key: "attempt_failed", label: "Attempt Failed / Cancelled", users: 0, events: 0 },
];

// Friendly labels for the IAP failure statuses the client forwards in
// `metadata.failure_status`. Falls back to the raw string if unmapped.
const FAILURE_LABELS: Record<string, string> = {
    user_cancelled: "User cancelled on Play sheet",
    trial_ineligible: "Trial already used on account",
    no_matching_trial_offer: "No active trial offer on Play",
    already_subscribed: "Already subscribed",
    purchased_no_transaction: "Play returned no transaction id",
    pending: "Payment pending",
    unknown: "Unknown / Other",
};

export default function SubscriptionFunnelPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [steps, setSteps] = useState<FunnelStep[]>(defaultSteps);
    const [pickerToTrialRate, setPickerToTrialRate] = useState<number | null>(null);
    const [pickerToPaidRate, setPickerToPaidRate] = useState<number | null>(null);
    const [billingMix, setBillingMix] = useState<BillingMix>({ monthly: 0, annual: 0, lifetime: 0 });
    const [failures, setFailures] = useState<FailureRow[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get("/admin/subscriptionFunnel");
                const data: FunnelResponse = res?.data?.data || {};

                const apiSteps = (data.steps || []).map((s) => ({
                    key: s.key || "",
                    label: s.label || "Step",
                    eventName: s.eventName,
                    users: Number(s.users || 0),
                    events: Number(s.events || 0),
                }));

                if (apiSteps.length > 0) setSteps(apiSteps);

                setPickerToTrialRate(
                    typeof data.pickerToTrialRate === "number" ? data.pickerToTrialRate : null
                );
                setPickerToPaidRate(
                    typeof data.pickerToPaidRate === "number" ? data.pickerToPaidRate : null
                );
                setBillingMix(data.billingMix || { monthly: 0, annual: 0, lifetime: 0 });
                setFailures(data.failureBreakdown || []);
            } catch {
                setError(
                    "Could not load subscription funnel. Make sure the backend exposes /admin/subscriptionFunnel."
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const pickerShown = useMemo(
        () => Math.max(steps.find((s) => s.key === "picker_shown")?.users || 0, 1),
        [steps]
    );

    const totalConverted = useMemo(() => {
        return (billingMix.monthly || 0) + (billingMix.annual || 0) + (billingMix.lifetime || 0);
    }, [billingMix]);

    const conversionRate = useMemo(() => {
        const trial = steps.find((s) => s.key === "trial_activated")?.users || 0;
        const paid = steps.find((s) => s.key === "purchased")?.users || 0;
        return Math.round(((trial + paid) / pickerShown) * 100);
    }, [steps, pickerShown]);

    // Hide per-period breakdown rows from the main step list — they show
    // better as a billing mix card below.
    const mainSteps = useMemo(
        () =>
            steps.filter(
                (s) =>
                    s.key !== "purchased_monthly" &&
                    s.key !== "purchased_annual" &&
                    s.key !== "purchased_lifetime"
            ),
        [steps]
    );

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Loading subscription funnel...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Subscription Funnel
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Measures how many users open the plan picker vs. how many actually activate a
                    trial or pay — broken down by billing period and failure reason. Data is mirrored
                    from the same Firebase conversion events the client fires for AdWords campaigns.
                </p>

                {error && (
                    <div className="mt-4 text-sm rounded-xl px-4 py-3 bg-amber-50 text-amber-700 border border-amber-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Picker Opens
                        </p>
                        <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                            {(steps.find((s) => s.key === "picker_shown")?.users || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Picker → Trial
                        </p>
                        <p className="text-2xl font-black mt-1 text-emerald-500">
                            {pickerToTrialRate != null ? `${pickerToTrialRate}%` : "—"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            of picker opens
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Picker → Paid
                        </p>
                        <p className="text-2xl font-black mt-1 text-indigo-500">
                            {pickerToPaidRate != null ? `${pickerToPaidRate}%` : "—"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            of picker opens
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Overall Conversion
                        </p>
                        <p className="text-2xl font-black mt-1 text-amber-500">
                            {Number.isFinite(conversionRate) ? conversionRate : 0}%
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            trial + paid combined
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    Step-by-Step Flow
                </h2>
                <div className="space-y-4">
                    {mainSteps.map((step, index) => {
                        const users = step.users || 0;
                        const pctOfStart = Math.round((users / pickerShown) * 100);
                        const isFail = step.key === "attempt_failed";
                        const isWin = step.key === "trial_activated" || step.key === "purchased";
                        return (
                            <div key={`${step.key}-${index}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {index + 1}. {step.label}
                                    </p>
                                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        {users.toLocaleString()} users · {(step.events || 0).toLocaleString()} events
                                    </div>
                                </div>
                                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                    <div
                                        className={
                                            isWin
                                                ? "h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600"
                                                : isFail
                                                    ? "h-full rounded-full bg-linear-to-r from-rose-400 to-rose-600"
                                                    : "h-full rounded-full bg-linear-to-r from-[#6366f1] to-[#22d3ee]"
                                        }
                                        style={{ width: `${Math.max(pctOfStart, 2)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                    <span>{pctOfStart}% of picker opens</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                        Billing-Period Mix
                    </h2>
                    <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                        Distinct users who completed a paid purchase, per billing cycle.
                    </p>
                    {totalConverted === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            No paid purchases recorded yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {(
                                [
                                    { key: "monthly", label: "Monthly", color: "from-indigo-400 to-indigo-600", value: billingMix.monthly },
                                    { key: "annual", label: "Annual", color: "from-emerald-400 to-emerald-600", value: billingMix.annual },
                                    { key: "lifetime", label: "Lifetime", color: "from-amber-400 to-amber-600", value: billingMix.lifetime },
                                ] as const
                            ).map((row) => {
                                const share = totalConverted > 0
                                    ? Math.round((row.value / totalConverted) * 100)
                                    : 0;
                                return (
                                    <div key={row.key}>
                                        <div className="flex items-center justify-between mb-1.5 text-sm">
                                            <span style={{ color: "var(--text-primary)" }}>{row.label}</span>
                                            <span style={{ color: "var(--text-muted)" }}>
                                                {row.value.toLocaleString()} ({share}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                            <div
                                                className={`h-full rounded-full bg-linear-to-r ${row.color}`}
                                                style={{ width: `${Math.max(share, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                        Why Attempts Failed
                    </h2>
                    <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                        Top reasons from Play Billing, aggregated across all surfaces.
                    </p>
                    {failures.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            No failed attempts recorded.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {failures.map((row) => {
                                const label = FAILURE_LABELS[row.reason] || row.reason;
                                return (
                                    <div
                                        key={row.reason}
                                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                                        style={{ background: "var(--bg-secondary)" }}
                                    >
                                        <span style={{ color: "var(--text-primary)" }}>{label}</span>
                                        <span className="font-bold text-rose-500">
                                            {row.count.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
