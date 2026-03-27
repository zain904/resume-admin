"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Profile {
    id: string;
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
    education: Array<{ id: string; degree: string; institution: string; gpa: string; graduationYear: string; }>;
    experience: Array<{ id: string; companyName: string; role: string; startMonth: string; startYear: string; endMonth: string; endYear: string; currentlyWorking: boolean; description: string; }>;
    projects: Array<{ id: string; projectTitle: string; projectDescription: string; role: string; duration: string; teamMembers: string; }>;
    skills: Array<{ id: string; skillName: string; proficiency: string; }>;
    strengths: Array<{ id: string; strengthName: string; }>;
    languages: Array<{ id: string; languageName: string; proficiency: string; }>;
    links: Array<{ id: string; name: string; link: string; }>;
}

interface UserDetail {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    userType: string;
    providerType: string;
    createdAt: string;
    profiles: Profile[];
    UserSubscription: {
        status: string;
        billing_cycle: string;
        started_at: string;
        expires_at: string;
        subscriptionPlan: { plan_tier: string; name: string; };
    } | null;
}

const Section = ({ title, icon, children, color = "#0ea5e9" }: {
    title: string; icon: React.ReactNode; children: React.ReactNode; color?: string;
}) => (
    <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: color + "15", color }}>
                {icon}
            </div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const Empty = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center py-6 gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bg-secondary)" }}>
            <svg className="w-5 h-5" style={{ color: "var(--text-muted)" }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
        </div>
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{text}</p>
    </div>
);

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeProfile, setActiveProfile] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get(`/admin/getUserProfile/${id}`);
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p style={{ color: "var(--text-muted)" }}>User not found</p>
                <button onClick={() => router.back()}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "#0ea5e9" }}>Go Back</button>
            </div>
        );
    }

    const profile = user.profiles?.[activeProfile] || null;
    const displayName = profile?.fullName || user.name || "Unknown";
    const planTier = user.UserSubscription?.subscriptionPlan?.plan_tier || "basic";
    const planMap: Record<string, { color: string; bg: string }> = {
        premium_pro: { color: "#8b5cf6", bg: "#8b5cf615" },
        premium: { color: "#0ea5e9", bg: "#0ea5e915" },
        basic: { color: "#64748b", bg: "#64748b15" },
    };
    const plan = planMap[planTier] || planMap.basic;

    return (
        <div className="space-y-5 pb-8">

            {/* Back */}
            <button onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
                style={{ color: "var(--text-secondary)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Users
            </button>

            {/* User Hero */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="h-32 bg-gradient-to-br from-[#0c4a6e] via-[#1e3a8a] to-[#4c1d95] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0ea5e9]/20 via-transparent to-[#7c3aed]/20" />
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
                </div>

                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                        <div className="shrink-0">
                            {profile?.profilePhoto ? (
                                <img src={profile.profilePhoto} alt={displayName}
                                    className="w-20 h-20 rounded-2xl object-cover border-4"
                                    style={{ borderColor: "var(--bg-card)" }} />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center text-white text-3xl font-bold border-4"
                                    style={{ borderColor: "var(--bg-card)" }}>
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 pb-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                                    {displayName}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold"
                                    style={{ background: plan.bg, color: plan.color }}>
                                    {planTier.replace("_", " ").toUpperCase()}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold"
                                    style={{
                                        background: user.userType === "user" ? "#10b98115" : "#f59e0b15",
                                        color: user.userType === "user" ? "#10b981" : "#f59e0b",
                                    }}>
                                    {user.userType === "user" ? "Member" : "Guest"}
                                </span>
                            </div>
                            {profile?.position && (
                                <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                                    {profile.position}
                                </p>
                            )}
                            {profile?.address && (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <svg className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{profile.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Account Email", value: user.email || "—" },
                            { label: "Provider", value: user.providerType || "—" },
                            { label: "Profile Email", value: profile?.emailAddress || "—" },
                            { label: "Phone", value: profile?.mobileNumber || "—" },
                        ].map((info) => (
                            <div key={info.label} className="p-3 rounded-xl"
                                style={{ background: "var(--bg-secondary)" }}>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{info.label}</p>
                                <p className="text-xs font-bold mt-1 truncate" style={{ color: "var(--text-primary)" }}>
                                    {info.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Multiple profiles tab */}
            {user.profiles && user.profiles.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {user.profiles.map((p, i) => (
                        <button key={p.id}
                            onClick={() => setActiveProfile(i)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0"
                            style={{
                                background: activeProfile === i ? "#0ea5e9" : "var(--bg-card)",
                                color: activeProfile === i ? "white" : "var(--text-secondary)",
                                border: "1px solid var(--border)",
                            }}>
                            Profile {i + 1} — {p.fullName || "Unnamed"}
                        </button>
                    ))}
                </div>
            )}

            {!profile ? (
                <div className="rounded-2xl p-8 text-center"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        This user has not created a resume profile yet.
                    </p>
                </div>
            ) : (
                <>
                    {/* Career Objective */}
                    {profile.careerObjective && (
                        <Section title="Career Objective" color="#0ea5e9" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        }>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                {profile.careerObjective}
                            </p>
                        </Section>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {/* Experience */}
                        <Section title="Experience" color="#0ea5e9" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }>
                            {profile.experience?.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.experience.map((exp, i) => (
                                        <div key={exp.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                                                    </svg>
                                                </div>
                                                {i < profile.experience.length - 1 && (
                                                    <div className="w-px flex-1 mt-2" style={{ background: "var(--border)" }} />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                                    {exp.role}
                                                </p>
                                                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--accent)" }}>
                                                    {exp.companyName}
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                    {exp.startMonth} {exp.startYear} —{" "}
                                                    {exp.currentlyWorking ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                                                </p>
                                                {exp.description && (
                                                    <p className="text-xs mt-2 leading-relaxed line-clamp-3"
                                                        style={{ color: "var(--text-secondary)" }}>
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <Empty text="No experience added" />}
                        </Section>

                        {/* Education */}
                        <Section title="Education" color="#8b5cf6" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        }>
                            {profile.education?.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.education.map((edu, i) => (
                                        <div key={edu.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                    </svg>
                                                </div>
                                                {i < profile.education.length - 1 && (
                                                    <div className="w-px flex-1 mt-2" style={{ background: "var(--border)" }} />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{edu.degree}</p>
                                                <p className="text-xs font-medium mt-0.5" style={{ color: "#8b5cf6" }}>{edu.institution}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                        Class of {edu.graduationYear}
                                                    </p>
                                                    {edu.gpa && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                                            style={{ background: "#8b5cf615", color: "#8b5cf6" }}>
                                                            GPA: {edu.gpa}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <Empty text="No education added" />}
                        </Section>

                        {/* Skills */}
                        <Section title="Skills" color="#10b981" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        }>
                            {profile.skills?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill) => (
                                        <span key={skill.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                                            style={{ background: "#10b98115", color: "#10b981" }}>
                                            {skill.skillName}
                                            {skill.proficiency && (
                                                <span className="opacity-60">· {skill.proficiency}</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            ) : <Empty text="No skills added" />}
                        </Section>

                        {/* Languages */}
                        <Section title="Languages" color="#f59e0b" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        }>
                            {profile.languages?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.languages.map((lang) => (
                                        <span key={lang.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                                            style={{ background: "#f59e0b15", color: "#f59e0b" }}>
                                            {lang.languageName}
                                            {lang.proficiency && <span className="opacity-60">· {lang.proficiency}</span>}
                                        </span>
                                    ))}
                                </div>
                            ) : <Empty text="No languages added" />}
                        </Section>

                        {/* Projects */}
                        <Section title="Projects" color="#ec4899" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        }>
                            {profile.projects?.length > 0 ? (
                                <div className="space-y-3">
                                    {profile.projects.map((proj) => (
                                        <div key={proj.id} className="p-3 rounded-xl"
                                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                                    {proj.projectTitle}
                                                </p>
                                                <div className="flex gap-1 shrink-0">
                                                    {proj.duration && (
                                                        <span className="text-xs px-2 py-0.5 rounded-md"
                                                            style={{ background: "#ec489915", color: "#ec4899" }}>
                                                            {proj.duration}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {proj.role && (
                                                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--accent)" }}>
                                                    {proj.role}
                                                </p>
                                            )}
                                            {proj.teamMembers && (
                                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                    Team: {proj.teamMembers}
                                                </p>
                                            )}
                                            {proj.projectDescription && (
                                                <p className="text-xs mt-1.5 leading-relaxed line-clamp-3"
                                                    style={{ color: "var(--text-secondary)" }}>
                                                    {proj.projectDescription}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : <Empty text="No projects added" />}
                        </Section>

                        {/* Strengths */}
                        <Section title="Strengths" color="#6366f1" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        }>
                            {profile.strengths?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.strengths.map((s) => (
                                        <span key={s.id} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                                            style={{ background: "#6366f115", color: "#6366f1" }}>
                                            {s.strengthName}
                                        </span>
                                    ))}
                                </div>
                            ) : <Empty text="No strengths added" />}
                        </Section>

                    </div>

                    {/* Links */}
                    {profile.links?.length > 0 && (
                        <Section title="Links" color="#0ea5e9" icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        }>
                            <div className="flex flex-wrap gap-2">
                                {profile.links.map((l) => (
                                    <a key={l.id} href={l.link} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                                        style={{ background: "#0ea5e915", color: "#0ea5e9" }}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        {l.name}
                                    </a>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Subscription */}
                    <Section title="Subscription Details" color="#10b981" icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    }>
                        {user.UserSubscription ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: "Plan", value: user.UserSubscription.subscriptionPlan?.name || planTier },
                                    { label: "Status", value: user.UserSubscription.status },
                                    { label: "Billing", value: user.UserSubscription.billing_cycle },
                                    {
                                        label: "Expires",
                                        value: new Date(user.UserSubscription.expires_at).getFullYear() > 2100
                                            ? "Lifetime"
                                            : new Date(user.UserSubscription.expires_at).toLocaleDateString()
                                    },
                                ].map((info) => (
                                    <div key={info.label} className="p-4 rounded-xl"
                                        style={{ background: "var(--bg-secondary)" }}>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{info.label}</p>
                                        <p className="text-sm font-bold mt-1 capitalize" style={{ color: "var(--text-primary)" }}>
                                            {info.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : <Empty text="No subscription found" />}
                    </Section>
                </>
            )}
        </div>
    );
}