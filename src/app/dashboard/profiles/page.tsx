"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Profile {
    id: string;
    userId: string;
    fullName: string;
    mobileNumber: string;
    emailAddress: string;
    address: string;
    careerObjective: string;
    profilePhoto: string | null;
    position: string;
    github: string | null;
    linkedin: string | null;
    website: string | null;
    isArchive: boolean;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        userType: string;
        providerType: string;
        createdAt: string;
    };
    education: Array<{
        id: string;
        degree: string;
        institution: string;
        gpa: string;
        graduationYear: string;
    }>;
    experience: Array<{
        id: string;
        companyName: string;
        role: string;
        startMonth: string;
        startYear: string;
        endMonth: string;
        endYear: string;
        currentlyWorking: boolean;
        description: string;
    }>;
    projects: Array<{
        id: string;
        projectTitle: string;
        projectDescription: string;
        role: string;
        duration: string;
    }>;
    skills: Array<{ id: string; skillName: string; proficiency: string }>;
    strengths: Array<{ id: string; strengthName: string }>;
    languages: Array<{ id: string; languageName: string; proficiency: string }>;
    links: Array<{ id: string; name: string; link: string }>;
}

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [filtered, setFiltered] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const res = await api.get("/admin/getAllProfiles");
                const data = Array.isArray(res.data) ? res.data : [];
                setProfiles(data);
                setFiltered(data);
            } catch (err) {
                console.error("Failed to fetch profiles:", err);
                setProfiles([]);
                setFiltered([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProfiles();
    }, []);

    useEffect(() => {
        if (!search.trim()) { setFiltered(profiles); return; }
        const q = search.toLowerCase();
        setFiltered(profiles.filter((p) =>
            p.fullName?.toLowerCase().includes(q) ||
            p.position?.toLowerCase().includes(q) ||
            p.emailAddress?.toLowerCase().includes(q) ||
            p.address?.toLowerCase().includes(q) ||
            p.user?.name?.toLowerCase().includes(q)
        ));
    }, [search, profiles]);

    const gradients = [
        "from-[#0ea5e9] to-[#7c3aed]",
        "from-[#7c3aed] to-[#ec4899]",
        "from-[#10b981] to-[#0ea5e9]",
        "from-[#f59e0b] to-[#ef4444]",
        "from-[#ec4899] to-[#8b5cf6]",
        "from-[#0ea5e9] to-[#10b981]",
    ];

    return (
        <div className="space-y-5 pb-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Resume Profiles
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {profiles.length} profiles created across all users
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--text-muted)" }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, position, location..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                    }}
                />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Profiles", value: profiles.length, color: "#0ea5e9" },
                    { label: "With Skills", value: profiles.filter(p => p.skills?.length > 0).length, color: "#10b981" },
                    { label: "With Experience", value: profiles.filter(p => p.experience?.length > 0).length, color: "#8b5cf6" },
                    { label: "With Photo", value: profiles.filter(p => p.profilePhoto).length, color: "#f59e0b" },
                ].map((s) => (
                    <div key={s.label} className="rounded-2xl p-4"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/10 to-[#7c3aed]/10 flex items-center justify-center">
                        <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                        No profiles found
                    </p>
                </div>
            ) : (
                /* ── GRID ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                    {filtered.map((profile, i) => {
                        const grad = gradients[i % gradients.length];
                        const initial = (profile.fullName || profile.user?.name || "?").charAt(0).toUpperCase();

                        return (
                            <div
                                key={profile.id}
                                className="rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
                                style={{
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border)",
                                    boxShadow: "var(--shadow)",
                                }}
                            >
                                {/* gradient top — overflow hidden only here */}
                                <div className={`h-20 bg-gradient-to-br ${grad} relative overflow-hidden rounded-t-2xl shrink-0`}>
                                    <div className="absolute inset-0 opacity-10"
                                        style={{
                                            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
                                            backgroundSize: "20px 20px",
                                        }} />
                                </div>

                                {/* card body */}
                                <div className="px-5 pb-5 flex-1">

                                    {/* avatar row */}
                                    <div className="-mt-8 mb-3 flex items-end justify-between">
                                        {profile.profilePhoto ? (
                                            <img
                                                src={profile.profilePhoto}
                                                alt={profile.fullName}
                                                className="w-16 h-16 rounded-2xl object-cover border-4"
                                                style={{ borderColor: "var(--bg-card)" }}
                                            />
                                        ) : (
                                            <div
                                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xl font-bold border-4`}
                                                style={{ borderColor: "var(--bg-card)" }}
                                            >
                                                {initial}
                                            </div>
                                        )}

                                        {/* skill + exp pills */}
                                        <div className="flex gap-1 mb-1 flex-wrap justify-end">
                                            {profile.skills?.length > 0 && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                                                    style={{ background: "#10b98115", color: "#10b981" }}>
                                                    {profile.skills.length} skills
                                                </span>
                                            )}
                                            {profile.experience?.length > 0 && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                                                    style={{ background: "#0ea5e915", color: "#0ea5e9" }}>
                                                    {profile.experience.length} exp
                                                </span>
                                            )}
                                            {profile.education?.length > 0 && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                                                    style={{ background: "#8b5cf615", color: "#8b5cf6" }}>
                                                    {profile.education.length} edu
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* name + position */}
                                    <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                        {profile.fullName || "No Name"}
                                    </h3>
                                    <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--accent)" }}>
                                        {profile.position || "No position"}
                                    </p>

                                    {/* contact */}
                                    <div className="mt-2 space-y-1.5">
                                        {profile.emailAddress && (
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                    {profile.emailAddress}
                                                </p>
                                            </div>
                                        )}
                                        {profile.mobileNumber && (
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                    {profile.mobileNumber}
                                                </p>
                                            </div>
                                        )}
                                        {profile.address && (
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                    {profile.address}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* career objective */}
                                    {profile.careerObjective && (
                                        <p className="text-xs mt-3 line-clamp-2 leading-relaxed"
                                            style={{ color: "var(--text-secondary)" }}>
                                            {profile.careerObjective}
                                        </p>
                                    )}

                                    {/* skills preview */}
                                    {profile.skills?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {profile.skills.slice(0, 3).map((skill) => (
                                                <span key={skill.id}
                                                    className="text-xs px-2 py-0.5 rounded-lg font-medium"
                                                    style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                                    {skill.skillName}
                                                </span>
                                            ))}
                                            {profile.skills.length > 3 && (
                                                <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                                                    style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                    +{profile.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* strengths preview */}
                                    {profile.strengths?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {profile.strengths.slice(0, 2).map((s) => (
                                                <span key={s.id}
                                                    className="text-xs px-2 py-0.5 rounded-lg font-medium"
                                                    style={{ background: "#6366f115", color: "#6366f1" }}>
                                                    {s.strengthName}
                                                </span>
                                            ))}
                                            {profile.strengths.length > 2 && (
                                                <span className="text-xs px-2 py-0.5 rounded-lg"
                                                    style={{ color: "var(--text-muted)" }}>
                                                    +{profile.strengths.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* divider */}
                                    <div className="my-3" style={{ borderTop: "1px solid var(--border)" }} />

                                    {/* footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                                            >
                                                {(profile.user?.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium truncate max-w-[100px]"
                                                    style={{ color: "var(--text-secondary)" }}>
                                                    {profile.user?.name || "Unknown"}
                                                </p>
                                                <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                                                    {profile.user?.providerType || "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/users/${profile.userId}`}
                                            className="flex items-center gap-1 text-xs font-semibold transition-all hover:gap-2 shrink-0"
                                            style={{ color: "var(--accent)" }}
                                        >
                                            Full Profile
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    Showing {filtered.length} of {profiles.length} profiles
                </p>
            )}
        </div>
    );
}