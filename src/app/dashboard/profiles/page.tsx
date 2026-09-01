"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
    DataTable,
    ErrorBanner,
    PageContent,
    PageHeader,
    PageShell,
    PaginationBar,
    Panel,
    SELECT_CLASS,
    tableCellClass,
    tableRowBorder,
    tableRowClass,
} from "@/components/admin/AdminUI";

interface Profile {
    id: string;
    userId: string;
    fullName: string;
    emailAddress: string;
    position: string;
    user: { name: string; email: string };
    skills: Array<{ id: string }>;
    experience: Array<{ id: string }>;
}

const TABLE_COLUMNS = [
    { label: "Name", className: "w-[22%]" },
    { label: "Position", className: "w-[20%]" },
    { label: "Email", className: "w-[28%]" },
    { label: "Skills", className: "w-[10%]" },
    { label: "Experience", className: "w-[12%]" },
    { label: "", className: "w-[8%]" },
];

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [userTypeFilter, setUserTypeFilter] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch, userTypeFilter]);

    const fetchProfiles = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(p), limit: "20" });
            if (debouncedSearch) params.set("search", debouncedSearch);
            if (userTypeFilter) params.set("userType", userTypeFilter);

            const res = await api.get(`/admin/getAllProfiles?${params}`);
            const body = res.data;
            setProfiles(body?.data ?? []);
            setTotal(body?.summary?.total ?? body?.pagination?.total ?? 0);
            setTotalPages(body?.pagination?.totalPages ?? 1);
        } catch {
            setProfiles([]);
            setError("Unable to load profiles.");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, userTypeFilter]);

    useEffect(() => { fetchProfiles(page); }, [page, fetchProfiles]);

    return (
        <PageShell>
            <PageHeader title="Profiles" description={`${total.toLocaleString()} resume profiles`} />

            <div className="flex flex-wrap gap-2">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email, position..."
                    className={`${SELECT_CLASS} flex-1 min-w-[200px] max-w-md`}
                />
                <select value={userTypeFilter} onChange={(e) => setUserTypeFilter(e.target.value)} className={SELECT_CLASS}>
                    <option value="">All users</option>
                    <option value="user">Members</option>
                    <option value="guest">Guests</option>
                </select>
            </div>

            {error && !loading && <ErrorBanner message={error} />}

            <Panel noPadding>
                <PageContent loading={loading} error={null} isEmpty={profiles.length === 0} emptyMessage="No profiles found.">
                    <DataTable columns={TABLE_COLUMNS}>
                        {profiles.map((p) => (
                            <tr key={p.id} className={tableRowClass()} style={tableRowBorder()}>
                                <td className={`${tableCellClass()} font-medium`} style={{ color: "var(--text-primary)" }}>
                                    {p.fullName || "—"}
                                </td>
                                <td className={tableCellClass()} style={{ color: "var(--text-secondary)" }}>
                                    {p.position || "—"}
                                </td>
                                <td className={tableCellClass()} style={{ color: "var(--text-muted)" }}>
                                    {p.emailAddress || p.user?.email || "—"}
                                </td>
                                <td className={`${tableCellClass()} tabular-nums`} style={{ color: "var(--text-secondary)" }}>
                                    {p.skills?.length ?? 0}
                                </td>
                                <td className={`${tableCellClass()} tabular-nums`} style={{ color: "var(--text-secondary)" }}>
                                    {p.experience?.length ?? 0}
                                </td>
                                <td className={tableCellClass()}>
                                    <Link href={`/dashboard/users/${p.userId}`} className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </DataTable>
                </PageContent>
            </Panel>

            <PaginationBar
                page={page}
                totalPages={totalPages}
                disabled={loading}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
        </PageShell>
    );
}
