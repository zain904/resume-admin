"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { ErrorBanner, PageHeader, PageShell } from "@/components/admin/AdminUI";

interface SettingsData {
    isMaintenance: boolean;
    updatedAt?: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/admin/settings");
            setSettings(res.data?.data ?? { isMaintenance: false });
        } catch {
            setError("Unable to load settings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    const applyMaintenance = async (next: boolean) => {
        setSaving(true);
        setError(null);
        try {
            const res = await api.put("/admin/settings", { isMaintenance: next });
            setSettings(res.data?.data ?? { isMaintenance: next });
            setToast(next
                ? "Maintenance is on. The app is temporarily unavailable to users."
                : "Maintenance is off. The app is available to users again.");
        } catch {
            setError("Could not update maintenance mode. Try again.");
        } finally {
            setSaving(false);
            setConfirmOpen(false);
        }
    };

    const onToggle = () => {
        if (!settings) return;
        if (!settings.isMaintenance) {
            setConfirmOpen(true);
            return;
        }
        applyMaintenance(false);
    };

    const isOn = !!settings?.isMaintenance;
    const updatedLabel = settings?.updatedAt
        ? new Date(settings.updatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    return (
        <PageShell>
            <PageHeader
                title="Settings"
                description="Manage how the app behaves for your users. Changes take effect immediately."
            />

            {error && <ErrorBanner message={error} />}

            {toast && (
                <div
                    className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                        background: isOn ? "rgba(244, 63, 94, 0.12)" : "rgba(16, 185, 129, 0.12)",
                        color: isOn ? "#e11d48" : "#059669",
                        border: `1px solid ${isOn ? "rgba(244, 63, 94, 0.28)" : "rgba(16, 185, 129, 0.28)"}`,
                    }}
                >
                    {toast}
                </div>
            )}

            <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow)",
                }}
            >
                <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{
                        background: isOn
                            ? "linear-gradient(90deg, #f43f5e, #f59e0b)"
                            : "linear-gradient(90deg, #10b981, #0ea5e9)",
                    }}
                />

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                                background: isOn
                                    ? "linear-gradient(135deg, #f43f5e, #f59e0b)"
                                    : "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                                boxShadow: "var(--shadow-md)",
                            }}
                        >
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOn ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                )}
                            </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                    Maintenance mode
                                </h2>
                                <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                    style={{
                                        background: isOn ? "rgba(244, 63, 94, 0.12)" : "rgba(16, 185, 129, 0.12)",
                                        color: isOn ? "#e11d48" : "#059669",
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                            background: isOn ? "#e11d48" : "#10b981",
                                            boxShadow: isOn ? "0 0 0 3px rgba(225,29,72,0.25)" : "0 0 0 3px rgba(16,185,129,0.25)",
                                        }}
                                    />
                                    {loading ? "Loading…" : isOn ? "Under maintenance" : "Available"}
                                </span>
                            </div>
                            <p className="text-sm mt-1.5 max-w-xl" style={{ color: "var(--text-muted)" }}>
                                Turn this on when you need to pause the app. Users will see a maintenance
                                message and will not be able to sign in until you turn it off.
                            </p>
                            {updatedLabel && (
                                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                                    Last updated {updatedLabel}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onToggle}
                            disabled={loading || saving || !settings}
                            aria-pressed={isOn}
                            className="relative w-16 h-9 rounded-full shrink-0 transition-all duration-300 disabled:opacity-50"
                            style={{
                                background: isOn
                                    ? "linear-gradient(135deg, #f43f5e, #fb7185)"
                                    : "var(--bg-secondary)",
                                border: isOn ? "1px solid transparent" : "1px solid var(--border)",
                            }}
                        >
                            <span
                                className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow transition-transform duration-300 ${isOn ? "translate-x-7" : "translate-x-0"}`}
                            />
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 mt-8">
                        {[
                            { title: "Shown in the app", body: "Users see a maintenance message instead of the sign-in screen." },
                            { title: "Sign-in paused", body: "New and returning users cannot create or enter an account." },
                            { title: "Admin access", body: "This dashboard stays available so you can restore the app anytime." },
                        ].map((card) => (
                            <div
                                key={card.title}
                                className="rounded-xl p-4"
                                style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                    {card.title}
                                </p>
                                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                    {card.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div
                        className="w-full max-w-md rounded-2xl p-6"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow-md)",
                        }}
                    >
                        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                            Turn on maintenance?
                        </h3>
                        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                            Users will not be able to sign in until you turn this off.
                            People who are already using the app may continue until they close it.
                        </p>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(false)}
                                disabled={saving}
                                className="px-4 py-2 rounded-xl text-sm font-medium"
                                style={{
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-secondary)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => applyMaintenance(true)}
                                disabled={saving}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                                style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
                            >
                                {saving ? "Saving…" : "Enable maintenance"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
