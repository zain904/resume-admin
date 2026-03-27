"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
    display_name?: string;
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-xs font-semibold w-28 shrink-0 pt-0.5 uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}>{label}</span>
            <span className="text-sm font-medium break-all" style={{ color: "var(--text-primary)" }}>
                {value || "—"}
            </span>
        </div>
    );
}

export default function ResumeViewerPage() {
    const params = useParams();
    const router = useRouter();
    const resumeId = params?.resumeId as string;

    const [resume, setResume] = useState<ResumeHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [pdfError, setPdfError] = useState(false);
    const [activeTab, setActiveTab] = useState<"preview" | "details">("preview");

    useEffect(() => {
        if (!resumeId) return;
        const fetchResume = async () => {
            try {
                // Fetch all and find by id (or use a dedicated endpoint if you add one)
                const res = await api.get(`/admin/getAllResumeHistories?limit=1000`);
                const all: ResumeHistory[] = res.data.data ?? [];
                const found = all.find(r => r.id === resumeId);
                setResume(found ?? null);
            } catch {
                setResume(null);
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, [resumeId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[#0ea5e9]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#0ea5e9] animate-spin" />
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading resume...</p>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Resume not found</p>
                <button onClick={() => router.back()}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    ← Go back
                </button>
            </div>
        );
    }

    const profile = resume.profile;
    const user = profile?.user;
    const template = resume.template;
    const isGuest = resume.userType === "guest";
    const displayName = profile?.fullName || user?.name || "Unknown";

    return (
        <div className="space-y-5 pb-8">

            {/* ── Breadcrumb ───────────────────────────────────── */}
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <Link href="/dashboard/resumes" className="hover:underline">Resumes</Link>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span style={{ color: "var(--text-primary)" }}>{displayName}</span>
            </div>

            {/* ── Hero header ──────────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e] via-[#1e3a8a] to-[#4c1d95]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0ea5e9]/20 via-transparent to-[#7c3aed]/20" />
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#0ea5e9]/10 blur-3xl" />

                <div className="relative z-10 p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg ${isGuest ? "bg-gradient-to-br from-[#ec4899] to-[#be185d]" : "bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed]"}`}>
                        {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isGuest ? "bg-[#ec4899]/30 text-pink-200" : "bg-[#0ea5e9]/30 text-sky-200"}`}>
                                {isGuest ? "Guest" : "Registered"}
                            </span>
                            {template?.isPremium && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-400/30 text-amber-200">
                                    ⭐ Premium Template
                                </span>
                            )}
                        </div>
                        {profile?.position && (
                            <p className="text-white/60 text-sm">{profile.position}</p>
                        )}
                        <p className="text-white/40 text-xs mt-1">
                            Generated {new Date(resume.createdAt).toLocaleDateString("en-US", {
                                month: "long", day: "numeric", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                            })}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                        {resume.url && (
                            <a href={resume.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0c4a6e] text-sm font-bold hover:scale-105 transition-transform shadow-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </a>
                        )}
                        <Link href={`/dashboard/users/${resume.userId}`}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-semibold border border-white/20 hover:bg-white/20 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View User
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Main content ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left: PDF viewer (takes 2/3) */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Tab switcher (mobile only) */}
                    <div className="flex lg:hidden rounded-xl overflow-hidden"
                        style={{ border: "1px solid var(--border)" }}>
                        {(["preview", "details"] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className="flex-1 py-2.5 text-sm font-semibold capitalize transition-colors"
                                style={{
                                    background: activeTab === tab ? "#0ea5e9" : "var(--bg-card)",
                                    color: activeTab === tab ? "white" : "var(--text-muted)"
                                }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* PDF iframe */}
                    <div className={`rounded-2xl overflow-hidden ${activeTab === "details" ? "hidden lg:block" : ""}`}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

                        <div className="flex items-center justify-between px-5 py-3.5"
                            style={{ borderBottom: "1px solid var(--border)" }}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="ml-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                                    Resume Preview
                                </span>
                            </div>
                            {resume.url && (
                                <a href={resume.url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-semibold text-[#0ea5e9] hover:underline flex items-center gap-1">
                                    Open in new tab
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        {resume.url && !pdfError ? (
                            <iframe
                                src={`${resume.url}#toolbar=0&navpanes=0&scrollbar=1`}
                                className="w-full"
                                style={{ height: "780px", border: "none" }}
                                title={`Resume - ${displayName}`}
                                onError={() => setPdfError(true)}
                            />
                        ) : (
                            /* Fallback: show template preview image if PDF fails */
                            <div className="flex flex-col items-center justify-center gap-5 p-10"
                                style={{ minHeight: "400px" }}>
                                {template?.preview_url && (
                                    <img src={template.preview_url} alt={template.name}
                                        className="max-h-80 rounded-xl shadow-lg object-contain" />
                                )}
                                <div className="text-center">
                                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                                        {resume.url ? "PDF preview unavailable in this browser" : "No PDF available"}
                                    </p>
                                    {resume.url && (
                                        <a href={resume.url} target="_blank" rel="noopener noreferrer"
                                            className="text-sm font-bold text-[#0ea5e9] hover:underline">
                                            Open PDF directly →
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Details sidebar */}
                <div className={`space-y-4 ${activeTab === "preview" ? "hidden lg:block" : ""}`}>

                    {/* Creator info */}
                    <div className="rounded-2xl p-5"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#0ea5e9] to-[#7c3aed]" />
                            <h3 className="text-sm font-bold uppercase tracking-widest"
                                style={{ color: "var(--text-muted)" }}>Creator</h3>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${isGuest ? "bg-gradient-to-br from-[#ec4899] to-[#be185d]" : "bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed]"}`}>
                                {(user?.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                    {isGuest ? "Guest User" : user?.name}
                                </p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    {isGuest ? user?.name : (user?.email || "—")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-0">
                            <InfoRow label="User ID" value={resume.userId} />
                            <InfoRow label="Account" value={isGuest ? "Guest / Anonymous" : "Registered"} />
                            <InfoRow label="Provider" value={user?.providerType} />
                            <InfoRow label="Email" value={user?.email || "—"} />
                        </div>

                        {!isGuest && (
                            <Link href={`/dashboard/users/${resume.userId}`}
                                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
                                style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                View Full Profile
                            </Link>
                        )}
                    </div>

                    {/* Profile info */}
                    <div className="rounded-2xl p-5"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#7c3aed] to-[#ec4899]" />
                            <h3 className="text-sm font-bold uppercase tracking-widest"
                                style={{ color: "var(--text-muted)" }}>Resume Profile</h3>
                        </div>

                        <div className="space-y-0">
                            <InfoRow label="Full Name" value={profile?.fullName} />
                            <InfoRow label="Position" value={profile?.position} />
                            <InfoRow label="Email" value={profile?.emailAddress} />
                            <InfoRow label="Phone" value={profile?.mobileNumber} />
                            <InfoRow label="Profile ID" value={profile?.id} />
                            <InfoRow label="Created" value={profile?.createdAt
                                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric"
                                }) : null} />
                        </div>
                    </div>

                    {/* Template info */}
                    <div className="rounded-2xl p-5"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#10b981] to-[#0ea5e9]" />
                            <h3 className="text-sm font-bold uppercase tracking-widest"
                                style={{ color: "var(--text-muted)" }}>Template Used</h3>
                        </div>

                        {template?.preview_url && (
                            <img src={template.preview_url} alt={template.name}
                                className="w-full h-32 object-cover object-top rounded-xl mb-4" />
                        )}

                        <InfoRow label="Name" value={template?.display_name || template?.name} />
                        <InfoRow label="Template" value={template?.name} />
                        <InfoRow label="Type" value={template?.isPremium ? "⭐ Premium" : "Free"} />

                        {(template?.categories ?? []).length > 0 && (
                            <div className="pt-3">
                                <p className="text-xs font-semibold mb-2 uppercase tracking-wide"
                                    style={{ color: "var(--text-muted)" }}>Categories</p>
                                <div className="flex flex-wrap gap-1">
                                    {(template?.categories ?? []).map(cat => (
                                        <span key={cat} className="text-xs px-2 py-0.5 rounded-lg"
                                            style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Generation info */}
                    <div className="rounded-2xl p-5"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#f59e0b] to-[#ef4444]" />
                            <h3 className="text-sm font-bold uppercase tracking-widest"
                                style={{ color: "var(--text-muted)" }}>Generation Info</h3>
                        </div>

                        <InfoRow label="History ID" value={resume.id} />
                        <InfoRow label="Generated" value={new Date(resume.createdAt).toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                        })} />

                        {resume.url && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold mb-2 uppercase tracking-wide"
                                    style={{ color: "var(--text-muted)" }}>PDF URL</p>
                                <p className="text-xs break-all p-2 rounded-lg"
                                    style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                    {resume.url}
                                </p>
                                <a href={resume.url} target="_blank" rel="noopener noreferrer"
                                    className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors hover:opacity-90 bg-gradient-to-r from-[#10b981] to-[#059669]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}