"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Template {
    id: string;
    name: string;
    display_name: string;
    description: string;
    preview_url: string;
    categories: string[];
    isPremium: boolean;
    price: number;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

interface Summary {
    total: number;
    premium: number;
    free: number;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const GRADIENTS = [
    "from-[#0ea5e9] to-[#7c3aed]",
    "from-[#10b981] to-[#0ea5e9]",
    "from-[#f59e0b] to-[#ef4444]",
    "from-[#ec4899] to-[#8b5cf6]",
    "from-[#7c3aed] to-[#ec4899]",
    "from-[#0ea5e9] to-[#10b981]",
    "from-[#6366f1] to-[#0ea5e9]",
    "from-[#f59e0b] to-[#10b981]",
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 50, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [isPremiumFilter, setIsPremiumFilter] = useState<"" | "true" | "false">("");
    const [page, setPage] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const fetchTemplates = async (p = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p.toString(), limit: "50" });
            if (isPremiumFilter !== "") params.set("isPremium", isPremiumFilter);

            const res = await api.get(`/admin/getAllTemplatesAdmin?${params}`);
            setTemplates(res.data.data ?? []);
            setSummary(res.data.summary ?? null);
            setPagination(res.data.pagination ?? { total: 0, page: p, limit: 50, totalPages: 1 });
        } catch {
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPage(1); fetchTemplates(1); }, [isPremiumFilter]);
    useEffect(() => { fetchTemplates(page); }, [page]);

    const totalUsage = templates.reduce((a, t) => a + (t.usageCount ?? 0), 0);

    return (
        <div className="space-y-5 pb-6">

            {/* ── Header ───────────────────────────────────────── */}
            <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Templates</h2>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {pagination.total} templates · {totalUsage} total resumes generated
                </p>
            </div>

            {/* ── Summary ──────────────────────────────────────── */}
            {summary && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Total", value: summary.total, color: "#0ea5e9" },
                        { label: "Premium", value: summary.premium, color: "#f59e0b" },
                        { label: "Free", value: summary.free, color: "#10b981" },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label} Templates</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Filter ───────────────────────────────────────── */}
            <div className="flex gap-3 flex-wrap">
                {[
                    { label: "All", value: "" as "" },
                    { label: "Free Only", value: "false" as "false" },
                    { label: "Premium Only", value: "true" as "true" },
                ].map(opt => (
                    <button key={opt.label}
                        onClick={() => setIsPremiumFilter(opt.value)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: isPremiumFilter === opt.value ? "#0ea5e9" : "var(--bg-card)",
                            color: isPremiumFilter === opt.value ? "white" : "var(--text-secondary)",
                            border: isPremiumFilter === opt.value ? "1px solid #0ea5e9" : "1px solid var(--border)"
                        }}>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* ── Grid ─────────────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No templates found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {templates.map((template, i) => {
                        const grad = GRADIENTS[i % GRADIENTS.length];
                        const pct = totalUsage > 0
                            ? Math.round(((template.usageCount ?? 0) / totalUsage) * 100)
                            : 0;

                        return (
                            <div key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

                                {/* Preview */}
                                <div className="relative h-40 overflow-hidden">
                                    {template.preview_url ? (
                                        <img
                                            src={template.preview_url}
                                            alt={template.display_name}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-28">
                                                <div className="h-1.5 bg-white/50 rounded-full mb-1.5" />
                                                <div className="h-1 bg-white/30 rounded-full mb-1 w-3/4" />
                                                <div className="h-px bg-white/20 my-2" />
                                                <div className="space-y-1">
                                                    <div className="h-1 bg-white/20 rounded-full" />
                                                    <div className="h-1 bg-white/20 rounded-full w-4/5" />
                                                    <div className="h-1 bg-white/20 rounded-full w-3/5" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay badges */}
                                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm ${template.isPremium ? "bg-amber-400/90 text-white" : "bg-emerald-500/90 text-white"}`}>
                                            {template.isPremium ? "⭐ Premium" : "Free"}
                                        </span>
                                        {(template.usageCount ?? 0) > 0 && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-black/50 text-white backdrop-blur-sm">
                                                {template.usageCount} uses
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                                            {template.display_name}
                                        </p>
                                        <span className="text-xs shrink-0 font-mono px-1.5 py-0.5 rounded"
                                            style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                            {template.name}
                                        </span>
                                    </div>

                                    <p className="text-xs leading-relaxed mb-3 line-clamp-2"
                                        style={{ color: "var(--text-muted)" }}>
                                        {template.description}
                                    </p>

                                    {/* Usage bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Usage</span>
                                            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                                {template.usageCount ?? 0} resumes · {pct}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                            <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                                                style={{ width: `${Math.max(pct, template.usageCount > 0 ? 4 : 0)}%` }} />
                                        </div>
                                    </div>

                                    {/* Categories (first 3) */}
                                    <div className="flex flex-wrap gap-1">
                                        {(template.categories ?? []).slice(0, 3).map(cat => (
                                            <span key={cat} className="text-xs px-1.5 py-0.5 rounded"
                                                style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                {cat}
                                            </span>
                                        ))}
                                        {(template.categories ?? []).length > 3 && (
                                            <span className="text-xs px-1.5 py-0.5 rounded"
                                                style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                +{(template.categories ?? []).length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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

            {/* ── Detail modal ─────────────────────────────────── */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                    onClick={() => setSelectedTemplate(null)}>
                    <div className="w-full max-w-lg rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                        onClick={e => e.stopPropagation()}>

                        {/* Preview */}
                        <div className="relative h-56 overflow-hidden">
                            {selectedTemplate.preview_url ? (
                                <img src={selectedTemplate.preview_url} alt={selectedTemplate.display_name}
                                    className="w-full h-full object-cover object-top" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed]" />
                            )}
                            <button onClick={() => setSelectedTemplate(null)}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                        {selectedTemplate.display_name}
                                    </h3>
                                    <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                                        {selectedTemplate.name}
                                    </p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${selectedTemplate.isPremium ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                                    {selectedTemplate.isPremium ? "⭐ Premium" : "Free"}
                                </span>
                            </div>

                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                {selectedTemplate.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary)" }}>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Uses</p>
                                    <p className="text-xl font-black mt-0.5" style={{ color: "var(--text-primary)" }}>
                                        {selectedTemplate.usageCount ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary)" }}>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Share of All Resumes</p>
                                    <p className="text-xl font-black mt-0.5" style={{ color: "var(--text-primary)" }}>
                                        {totalUsage > 0 ? Math.round(((selectedTemplate.usageCount ?? 0) / totalUsage) * 100) : 0}%
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Categories</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(selectedTemplate.categories ?? []).map(cat => (
                                        <span key={cat} className="text-xs px-2 py-1 rounded-lg"
                                            style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Added {new Date(selectedTemplate.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}