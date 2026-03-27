"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface ResumeUser {
    id: string;
    name: string;
    email: string;
    userType: string;
    providerType: string;
}

interface ResumeProfile {
    id: string;
    fullName: string;
    emailAddress: string | null;
    mobileNumber: string | null;
    position: string | null;
    isArchive: boolean;
    createdAt: string;
    user: ResumeUser;
}

interface ResumeTemplate {
    id: string;
    name: string;
    preview_url: string;
    isPremium: boolean;
    categories: string[];
}

interface ResumeHistory {
    id: string;
    profileId: string;
    templateId: string;
    userId: string;
    userType: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    profile: ResumeProfile | null;
    template: ResumeTemplate | null;
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
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });
}

export default function ResumesPage() {
    const router = useRouter();
    const [resumes, setResumes] = useState<ResumeHistory[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [userTypeFilter, setUserTypeFilter] = useState<"" | "user" | "guest">("");
    const [page, setPage] = useState(1);

    const fetchResumes = async (p = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p.toString(), limit: "12" });
            if (userTypeFilter) params.set("userType", userTypeFilter);

            const res = await api.get(`/admin/getAllResumeHistories?${params}`);
            setResumes(res.data.data ?? []);
            setPagination(res.data.pagination ?? { total: 0, page: p, limit: 12, totalPages: 1 });
        } catch {
            setResumes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPage(1); fetchResumes(1); }, [userTypeFilter]);
    useEffect(() => { fetchResumes(page); }, [page]);

    return (
        <div className="space-y-5 pb-6">

            {/* ── Header ───────────────────────────────────────── */}
            <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Resume Histories</h2>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {pagination.total} resumes generated
                </p>
            </div>

            {/* ── Filters ──────────────────────────────────────── */}
            <div className="flex gap-3 flex-wrap">
                {[
                    { label: "All Users", value: "" as "" },
                    { label: "Registered", value: "user" as "user" },
                    { label: "Guests", value: "guest" as "guest" },
                ].map(opt => (
                    <button key={opt.label}
                        onClick={() => setUserTypeFilter(opt.value)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: userTypeFilter === opt.value ? "#0ea5e9" : "var(--bg-card)",
                            color: userTypeFilter === opt.value ? "white" : "var(--text-secondary)",
                            border: userTypeFilter === opt.value ? "1px solid #0ea5e9" : "1px solid var(--border)"
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
            ) : resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/10 to-[#7c3aed]/10 flex items-center justify-center">
                        <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No resumes found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {resumes.map((resume, i) => {
                        const grad = GRADIENTS[i % GRADIENTS.length];
                        const profile = resume.profile;
                        const user = profile?.user;
                        const isGuest = resume.userType === "guest";

                        const displayName = profile?.fullName || user?.name || "Unknown";
                        const initial = displayName.charAt(0).toUpperCase();
                        const subLabel = profile?.position || profile?.emailAddress || user?.email || "—";

                        return (
                            <div key={resume.id}
                                onClick={() => router.push(`/dashboard/resumes/${resume.id}`)}
                                className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

                                {/* ── Template preview ─────────────────── */}
                                <div className="relative h-36 overflow-hidden">
                                    {resume.template?.preview_url ? (
                                        <img
                                            src={resume.template.preview_url}
                                            alt={resume.template.name}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-36">
                                                <div className="w-8 h-8 rounded-full bg-white/40 mb-2 mx-auto" />
                                                <div className="h-1.5 bg-white/40 rounded-full mb-1.5" />
                                                <div className="h-1 bg-white/30 rounded-full mb-1 w-3/4 mx-auto" />
                                                <div className="space-y-1 mt-2">
                                                    <div className="h-1 bg-white/20 rounded-full" />
                                                    <div className="h-1 bg-white/20 rounded-full w-5/6" />
                                                    <div className="h-1 bg-white/20 rounded-full w-4/6" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Badges overlay */}
                                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                        {/* Template name */}
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-black/40 text-white backdrop-blur-sm">
                                            {resume.template?.name ?? "Unknown Template"}
                                        </span>
                                        {/* User type */}
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm ${isGuest ? "bg-[#ec4899]/80 text-white" : "bg-[#0ea5e9]/80 text-white"}`}>
                                            {isGuest ? "Guest" : "User"}
                                        </span>
                                    </div>

                                    {/* Premium badge */}
                                    {resume.template?.isPremium && (
                                        <div className="absolute bottom-2 right-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-400/90 text-white backdrop-blur-sm">
                                                ⭐ Premium
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Info ─────────────────────────────── */}
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${isGuest ? "bg-gradient-to-br from-[#ec4899] to-[#be185d]" : "bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed]"}`}>
                                            {initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                                                {displayName}
                                            </p>
                                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                {subLabel}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    {(resume.template?.categories ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {(resume.template?.categories ?? []).slice(0, 2).map(cat => (
                                                <span key={cat} className="text-xs px-1.5 py-0.5 rounded"
                                                    style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3"
                                        style={{ borderTop: "1px solid var(--border)" }}>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            {formatDate(resume.createdAt)}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            {/* Download PDF */}
                                            {resume.url && (
                                                <a href={resume.url} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs font-semibold transition-all hover:gap-1.5 text-[#10b981]"
                                                    onClick={e => e.stopPropagation()}>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    PDF
                                                </a>
                                            )}

                                            {/* View profile */}
                                            <Link href={`/dashboard/users/${resume.userId}`}
                                                className="flex items-center gap-1 text-xs font-semibold transition-all hover:gap-1.5"
                                                style={{ color: "var(--accent)" }}>
                                                Profile
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
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
        </div>
    );
}