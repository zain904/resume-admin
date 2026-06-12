// "use client";

// import { useEffect, useMemo, useState } from "react";
// import api from "@/lib/api";

// // ---------------------------------------------------------------------------
// // Payload shape returned by GET /admin/onboardingFunnelV2
// // Mirror of the backend `getOnboardingFunnelV2` controller so a
// // backend-only tweak (adding a step / segment) shows up here as a
// // compile error instead of a silent empty row.
// // ---------------------------------------------------------------------------
// type Segment = {
//     key: string;
//     label: string;
//     users: number;
// };

// type MainStep = {
//     index: number;
//     key: string;
//     label: string;
//     users?: number;
//     segments?: Segment[];
// };

// type EditStep = {
//     index: number;
//     key: string;
//     label: string;
//     users: number;
// };

// type SegmentedBlock = {
//     key: string;
//     label: string;
//     segments: Segment[];
// };

// type FunnelV2Response = {
//     totalStarted: number;
//     endings: {
//         leftViaSignIn: number;
//         finalAction: number;
//     };
//     main: MainStep[];
//     editBranch: {
//         cohortSize: number;
//         steps: EditStep[];
//         savePromptShown: { key: string; label: string; users: number };
//         signInOutcomes: SegmentedBlock;
//         finalActions: SegmentedBlock;
//     };
// };

// // Color palette for segments. Each segment gets a stable color so the
// // same label always renders in the same shade across refreshes.
// const SEGMENT_COLORS = [
//     "#6366f1", // indigo
//     "#22d3ee", // cyan
//     "#f59e0b", // amber
//     "#10b981", // emerald
//     "#ef4444", // red
//     "#a855f7", // purple
// ];

// function segmentColor(index: number): string {
//     return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
// }

// function pct(n: number, denom: number): number {
//     if (!denom || denom <= 0) return 0;
//     return Math.round((n / denom) * 100);
// }

// // ---------------------------------------------------------------------------
// // Re-usable bits
// // ---------------------------------------------------------------------------
// function KpiTile({
//     title,
//     value,
//     hint,
//     accent,
// }: {
//     title: string;
//     value: number;
//     hint?: string;
//     accent?: string;
// }) {
//     return (
//         <div
//             className="rounded-xl p-4"
//             style={{ background: "var(--bg-secondary)" }}
//         >
//             <p
//                 className="text-xs uppercase tracking-widest"
//                 style={{ color: "var(--text-muted)" }}
//             >
//                 {title}
//             </p>
//             <p
//                 className="text-2xl font-black mt-1"
//                 style={{ color: accent || "var(--text-primary)" }}
//             >
//                 {value.toLocaleString()}
//             </p>
//             {hint ? (
//                 <p
//                     className="text-xs mt-1"
//                     style={{ color: "var(--text-muted)" }}
//                 >
//                     {hint}
//                 </p>
//             ) : null}
//         </div>
//     );
// }

// function SingleBarRow({
//     label,
//     users,
//     widthPct,
//     stepNumber,
//     fromPrevPct,
//     denominatorLabel,
// }: {
//     label: string;
//     users: number;
//     widthPct: number;
//     stepNumber?: string;
//     fromPrevPct?: number | null;
//     denominatorLabel: string;
// }) {
//     return (
//         <div>
//             <div className="flex items-center justify-between mb-1.5">
//                 <p
//                     className="text-sm font-semibold"
//                     style={{ color: "var(--text-primary)" }}
//                 >
//                     {stepNumber ? `${stepNumber}. ` : ""}
//                     {label}
//                 </p>
//                 <div
//                     className="text-xs"
//                     style={{ color: "var(--text-muted)" }}
//                 >
//                     {users.toLocaleString()} users
//                 </div>
//             </div>
//             <div
//                 className="h-2.5 rounded-full overflow-hidden"
//                 style={{ background: "var(--bg-secondary)" }}
//             >
//                 <div
//                     className="h-full rounded-full bg-linear-to-r from-[#6366f1] to-[#22d3ee]"
//                     style={{ width: `${Math.max(widthPct, 2)}%` }}
//                 />
//             </div>
//             <div
//                 className="flex items-center justify-between mt-1.5 text-xs"
//                 style={{ color: "var(--text-muted)" }}
//             >
//                 <span>
//                     {widthPct}% {denominatorLabel}
//                 </span>
//                 {fromPrevPct != null ? (
//                     <span>{fromPrevPct}% from previous step</span>
//                 ) : null}
//             </div>
//         </div>
//     );
// }

// function SegmentedBarRow({
//     label,
//     segments,
//     stepNumber,
//     denominator,
//     denominatorLabel,
// }: {
//     label: string;
//     segments: Segment[];
//     stepNumber?: string;
//     denominator: number;
//     denominatorLabel: string;
// }) {
//     const total = segments.reduce((sum, s) => sum + (s.users || 0), 0);
//     const barDenom = Math.max(total, 1);

//     return (
//         <div>
//             <div className="flex items-center justify-between mb-1.5">
//                 <p
//                     className="text-sm font-semibold"
//                     style={{ color: "var(--text-primary)" }}
//                 >
//                     {stepNumber ? `${stepNumber}. ` : ""}
//                     {label}
//                 </p>
//                 <div
//                     className="text-xs"
//                     style={{ color: "var(--text-muted)" }}
//                 >
//                     {total.toLocaleString()} users
//                 </div>
//             </div>
//             <div
//                 className="h-2.5 rounded-full overflow-hidden flex"
//                 style={{ background: "var(--bg-secondary)" }}
//             >
//                 {segments.map((seg, i) => {
//                     const widthPct = (seg.users / barDenom) * 100;
//                     return (
//                         <div
//                             key={seg.key}
//                             className="h-full"
//                             style={{
//                                 width: `${widthPct}%`,
//                                 background: segmentColor(i),
//                             }}
//                             title={`${seg.label}: ${seg.users.toLocaleString()}`}
//                         />
//                     );
//                 })}
//             </div>
//             <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs">
//                 {segments.map((seg, i) => (
//                     <span
//                         key={`${seg.key}-legend`}
//                         className="inline-flex items-center gap-1.5"
//                         style={{ color: "var(--text-muted)" }}
//                     >
//                         <span
//                             className="inline-block w-2.5 h-2.5 rounded-sm"
//                             style={{ background: segmentColor(i) }}
//                         />
//                         {seg.label}: {seg.users.toLocaleString()}{" "}
//                         {denominator > 0
//                             ? `(${pct(seg.users, denominator)}% ${denominatorLabel})`
//                             : ""}
//                     </span>
//                 ))}
//             </div>
//         </div>
//     );
// }

// // ---------------------------------------------------------------------------
// // Page
// // ---------------------------------------------------------------------------
// export default function OnboardingFunnelPage() {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [data, setData] = useState<FunnelV2Response | null>(null);

//     useEffect(() => {
//         const load = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const res = await api.get("/admin/onboardingFunnelV2");
//                 const body = res?.data?.data as FunnelV2Response | undefined;
//                 if (!body) {
//                     throw new Error("Empty response");
//                 }
//                 setData(body);
//             } catch {
//                 setError(
//                     "Could not load the onboarding funnel. Make sure the backend exposes /admin/onboardingFunnelV2.",
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };
//         load();
//     }, []);

//     // Denominator for the main flow: total users who started onboarding.
//     // We clamp to 1 so divide-by-zero doesn't blow up the bar widths.
//     const startCount = useMemo(() => {
//         const firstStep = data?.main?.[0];
//         const fromStep = firstStep?.users ?? 0;
//         return Math.max(data?.totalStarted ?? fromStep, 1);
//     }, [data]);

//     const editCohortSize = useMemo(() => {
//         return Math.max(data?.editBranch?.cohortSize ?? 0, 1);
//     }, [data]);

//     // We only show the "from previous step" footnote on single-count
//     // steps — segmented steps don't have a single number to compare.
//     const prevUsersForStep = useMemo(() => {
//         const map: Record<number, number> = {};
//         if (!data?.main) return map;
//         let prev = 0;
//         for (const step of data.main) {
//             const thisCount =
//                 step.users ??
//                 (step.segments
//                     ? step.segments.reduce((s, seg) => s + (seg.users || 0), 0)
//                     : 0);
//             map[step.index] = prev;
//             prev = thisCount;
//         }
//         return map;
//     }, [data]);

//     if (loading) {
//         return (
//             <div className="min-h-[60vh] flex items-center justify-center">
//                 <div
//                     className="text-sm font-medium"
//                     style={{ color: "var(--text-muted)" }}
//                 >
//                     Loading onboarding funnel...
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header + 3 KPI tiles for the funnel's three ending points. */}
//             <div
//                 className="rounded-2xl p-6"
//                 style={{
//                     background: "var(--bg-card)",
//                     border: "1px solid var(--border)",
//                 }}
//             >
//                 <h1
//                     className="text-xl font-bold"
//                     style={{ color: "var(--text-primary)" }}
//                 >
//                     Onboarding Funnel
//                 </h1>
//                 <p
//                     className="text-sm mt-1"
//                     style={{ color: "var(--text-muted)" }}
//                 >
//                     Single-funnel view of the full onboarding journey with
//                     two ending points: users who leave via the{" "}
//                     <span className="font-semibold">Sign-in</span> dialog
//                     inside Review &amp; Download, and users whose last
//                     action is{" "}
//                     <span className="font-semibold">share / download / close</span>
//                     {" "}on the final resume.
//                 </p>

//                 {error && (
//                     <div className="mt-4 text-sm rounded-xl px-4 py-3 bg-amber-50 text-amber-700 border border-amber-100">
//                         {error}
//                     </div>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
//                     <KpiTile
//                         title="End 1 · Left via sign-in"
//                         value={data?.endings.leftViaSignIn ?? 0}
//                         hint={`${pct(data?.endings.leftViaSignIn ?? 0, editCohortSize)}% of Review & Download cohort`}
//                         accent="#f59e0b"
//                     />
//                     <KpiTile
//                         title="End 2 · Final action (share/download/close)"
//                         value={data?.endings.finalAction ?? 0}
//                         hint={`${pct(data?.endings.finalAction ?? 0, editCohortSize)}% of Review & Download cohort`}
//                         accent="#6366f1"
//                     />
//                 </div>
//             </div>

//             {/* Section A — main flow, steps 1-10. */}
//             <div
//                 className="rounded-2xl p-6"
//                 style={{
//                     background: "var(--bg-card)",
//                     border: "1px solid var(--border)",
//                 }}
//             >
//                 <div className="flex items-baseline justify-between mb-4">
//                     <h2
//                         className="text-base font-bold"
//                         style={{ color: "var(--text-primary)" }}
//                     >
//                         Main flow (all users)
//                     </h2>
//                     <p
//                         className="text-xs"
//                         style={{ color: "var(--text-muted)" }}
//                     >
//                         {startCount.toLocaleString()} onboarding starts ·
//                         bar widths are relative to this denominator
//                     </p>
//                 </div>

//                 <div className="space-y-4">
//                     {(data?.main || []).map((step) => {
//                         const stepNumber = `${step.index}`;
//                         if (step.segments && step.segments.length > 0) {
//                             return (
//                                 <SegmentedBarRow
//                                     key={step.key}
//                                     stepNumber={stepNumber}
//                                     label={step.label}
//                                     segments={step.segments}
//                                     denominator={startCount}
//                                     denominatorLabel="of onboarding starts"
//                                 />
//                             );
//                         }
//                         const users = step.users ?? 0;
//                         const prev = prevUsersForStep[step.index] ?? 0;
//                         const fromPrev =
//                             prev > 0 ? Math.round((users / prev) * 100) : null;
//                         return (
//                             <SingleBarRow
//                                 key={step.key}
//                                 stepNumber={stepNumber}
//                                 label={step.label}
//                                 users={users}
//                                 widthPct={pct(users, startCount)}
//                                 fromPrevPct={fromPrev}
//                                 denominatorLabel="of onboarding starts"
//                             />
//                         );
//                     })}
//                 </div>
//             </div>

//             {/* Section B — Review-and-Download branch (formerly edit-my-details). */}
//             <div
//                 className="rounded-2xl p-6"
//                 style={{
//                     background: "var(--bg-card)",
//                     border: "1px solid var(--border)",
//                 }}
//             >
//                 <div className="flex items-baseline justify-between mb-4">
//                     <h2
//                         className="text-base font-bold"
//                         style={{ color: "var(--text-primary)" }}
//                     >
//                         Review &amp; Download branch
//                     </h2>
//                     <p
//                         className="text-xs"
//                         style={{ color: "var(--text-muted)" }}
//                     >
//                         {(data?.editBranch?.cohortSize ?? 0).toLocaleString()}{" "}
//                         users in cohort · bar widths relative to cohort size
//                     </p>
//                 </div>

//                 <div className="space-y-4">
//                     {(data?.editBranch?.steps || []).map((step) => {
//                         const stepLabel = `12.${step.index}`;
//                         return (
//                             <SingleBarRow
//                                 key={step.key}
//                                 stepNumber={stepLabel}
//                                 label={step.label}
//                                 users={step.users}
//                                 widthPct={pct(step.users, editCohortSize)}
//                                 denominatorLabel="of edit-details cohort"
//                             />
//                         );
//                     })}

//                     {data?.editBranch?.savePromptShown ? (
//                         <SingleBarRow
//                             stepNumber="13"
//                             label={data.editBranch.savePromptShown.label}
//                             users={data.editBranch.savePromptShown.users}
//                             widthPct={pct(
//                                 data.editBranch.savePromptShown.users,
//                                 editCohortSize,
//                             )}
//                             denominatorLabel="of edit-details cohort"
//                         />
//                     ) : null}

//                     {data?.editBranch?.signInOutcomes ? (
//                         <SegmentedBarRow
//                             stepNumber="14"
//                             label={data.editBranch.signInOutcomes.label}
//                             segments={data.editBranch.signInOutcomes.segments}
//                             denominator={
//                                 data.editBranch.savePromptShown?.users ||
//                                 editCohortSize
//                             }
//                             denominatorLabel="of save-prompt shown"
//                         />
//                     ) : null}

//                     {data?.editBranch?.finalActions ? (
//                         <SegmentedBarRow
//                             stepNumber="16"
//                             label={data.editBranch.finalActions.label}
//                             segments={data.editBranch.finalActions.segments}
//                             denominator={editCohortSize}
//                             denominatorLabel="of edit-details cohort"
//                         />
//                     ) : null}
//                 </div>
//             </div>
//         </div>
//     );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Segment = { key: string; label: string; users: number };
type MainStep = { index: number; key: string; label: string; users?: number; segments?: Segment[] };
type EditStep = { index: number; key: string; label: string; users: number };
type SegmentedBlock = { key: string; label: string; segments: Segment[] };
type SimpleRow = { key: string; label: string; users: number };
type BuildMethodDetail = {
  screen: SimpleRow;
  selected: { key: string; label: string; segments: Segment[] };
  quickAi: SimpleRow[];
  linkedin: SimpleRow[];
  upload: SimpleRow[];
};
type FunnelV2Response = {
  totalStarted: number;
  endings: { leftViaSignIn: number; finalAction: number };
  main: MainStep[];
  jobPrefsDetail?: SimpleRow[];
  buildMethodDetail?: BuildMethodDetail;
  editBranch: {
    cohortSize: number;
    steps: EditStep[];
    savePromptShown: SimpleRow;
    signInOutcomes: SegmentedBlock;
    finalActions: SegmentedBlock;
  };
};

// ─── Utils ────────────────────────────────────────────────────────────────────
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
const fmt = (n: number) => n.toLocaleString();

const SEG_COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a855f7"];
const segClr = (i: number) => SEG_COLORS[i % SEG_COLORS.length];

function dropColor(r: number) {
  if (r >= 75) return "#10b981";
  if (r >= 50) return "#f59e0b";
  return "#f43f5e";
}

// ─── Single funnel row ────────────────────────────────────────────────────────
function Row({
  index,
  label,
  users,
  denominator,
  prevUsers,
  segments,
  barColor = "#6366f1",
  isNew,
}: {
  index?: string | number;
  label: string;
  users: number;
  denominator: number;
  prevUsers?: number;
  segments?: Segment[];
  barColor?: string;
  isNew?: boolean;
}) {
  const isSegmented = !!segments?.length;
  const total = isSegmented ? segments!.reduce((s, g) => s + g.users, 0) : users;
  const width = pct(total, Math.max(denominator, 1));
  const retained = prevUsers ? pct(total, prevUsers) : null;
  const segTotal = isSegmented ? Math.max(segments!.reduce((s, g) => s + g.users, 0), 1) : 1;

  return (
    <div className="py-4">
      {/* Top row: step label + user count */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <span className="text-xs tabular-nums w-6 text-right flex-shrink-0"
              style={{ color: "var(--text-muted)" }}>
              {index}
            </span>
          )}
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {label}
          </span>
          {isNew && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "#10b98120", color: "#10b981" }}>
              new
            </span>
          )}
        </div>
        <span className="text-sm font-semibold tabular-nums ml-4 flex-shrink-0"
          style={{ color: "var(--text-primary)" }}>
          {fmt(total)}
        </span>
      </div>

      {/* Bar */}
      <div className="flex items-center gap-3"
        style={{ paddingLeft: index !== undefined ? 32 : 0 }}>
        <div className="flex-1 relative h-2 rounded-full overflow-hidden"
          style={{ background: "var(--bg-secondary)" }}>
          {!isSegmented ? (
            <div className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${Math.max(width, 1)}%`, background: barColor }} />
          ) : (
            <div className="absolute inset-0 flex">
              {segments!.map((seg, i) => (
                <div key={seg.key} className="h-full"
                  style={{ width: `${(seg.users / segTotal) * 100}%`, background: segClr(i) }}
                  title={`${seg.label}: ${fmt(seg.users)}`} />
              ))}
            </div>
          )}
        </div>
        <span className="text-xs tabular-nums w-9 text-right flex-shrink-0"
          style={{ color: "var(--text-muted)" }}>
          {width}%
        </span>
      </div>

      {/* Segment legend */}
      {isSegmented && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2"
          style={{ paddingLeft: index !== undefined ? 32 : 0 }}>
          {segments!.map((seg, i) => (
            <span key={seg.key} className="inline-flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}>
              <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: segClr(i) }} />
              {seg.label}
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {fmt(seg.users)}
              </span>
              <span>({pct(seg.users, segTotal)}%)</span>
            </span>
          ))}
        </div>
      )}

      {/* Drop-off */}
      {retained !== null && (
        <div className="flex items-center gap-1.5 mt-1.5"
          style={{ paddingLeft: index !== undefined ? 32 : 0 }}>
          <span className="text-xs font-medium tabular-nums"
            style={{ color: dropColor(retained) }}>
            {retained}% from prev
          </span>
          {prevUsers && prevUsers > total && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              · {fmt(prevUsers - total)} dropped
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  meta,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div
        className={`flex items-center justify-between px-5 py-3 ${collapsible ? "cursor-pointer select-none" : ""}`}
        style={{ borderBottom: open ? "1px solid var(--border)" : undefined }}
        onClick={() => collapsible && setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </span>
          {meta && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {meta}
            </span>
          )}
        </div>
        {collapsible && (
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
            {open ? "▲" : "▼"}
          </span>
        )}
      </div>
      {open && (
        <div className="px-5 divide-y" style={{ borderColor: "var(--border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── KPI tiles ────────────────────────────────────────────────────────────────
function KpiTile({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-2xl font-bold tabular-nums mb-0.5" style={{ color }}>{fmt(value)}</p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingFunnelPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [data, setData]     = useState<FunnelV2Response | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const res  = await api.get("/admin/onboardingFunnelV2");
        const body = res?.data?.data as FunnelV2Response | undefined;
        if (!body) throw new Error("Empty response");
        setData(body);
      } catch {
        setError("Could not load the onboarding funnel. Check that /admin/onboardingFunnelV2 is reachable.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalStarted   = useMemo(() => Math.max(data?.totalStarted ?? 1, 1), [data]);
  const editCohortSize = useMemo(() => Math.max(data?.editBranch?.cohortSize ?? 0, 1), [data]);
  const mainStepUsers  = useMemo(() =>
    (data?.main ?? []).map(s => s.users ?? s.segments?.reduce((a, b) => a + b.users, 0) ?? 0),
    [data]);
  const buildScreenUsers = data?.buildMethodDetail?.screen?.users ?? 0;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="space-y-2 w-48 animate-pulse">
          {[100, 80, 65, 55, 42].map((w, i) => (
            <div key={i} className="h-2 rounded-full"
              style={{ width: `${w}%`, background: "var(--bg-secondary)" }} />
          ))}
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl p-5 text-sm"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "#f43f5e" }}>
        {error ?? "No data."}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Onboarding Funnel
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Full journey from first open to final resume action.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiTile label="Onboarding starts" value={data.totalStarted}
          sub="Unique users" color="#6366f1" />
        <KpiTile label="Reached Review & Download" value={data.editBranch.cohortSize}
          sub={`${pct(data.editBranch.cohortSize, totalStarted)}% of starts`} color="#22d3ee" />
        <KpiTile label="Left via sign-in" value={data.endings.leftViaSignIn}
          sub={`${pct(data.endings.leftViaSignIn, editCohortSize)}% of R&D cohort`} color="#f59e0b" />
        <KpiTile label="Completed final action" value={data.endings.finalAction}
          sub={`${pct(data.endings.finalAction, editCohortSize)}% of R&D cohort`} color="#10b981" />
      </div>

      {/* Main flow */}
      <Section title="Main Flow" meta={`${fmt(totalStarted)} starts`}>
        {data.main.map((step, idx) => {
          const users = step.users ?? step.segments?.reduce((a, b) => a + b.users, 0) ?? 0;
          return (
            <Row
              key={step.key}
              index={step.index}
              label={step.label}
              users={users}
              denominator={totalStarted}
              prevUsers={idx > 0 ? mainStepUsers[idx - 1] : undefined}
              segments={step.segments}
              barColor="#6366f1"
            />
          );
        })}
      </Section>

      {/* Job prefs detail — only when v3 backend */}
      {data.jobPrefsDetail && (
        <Section
          title="Job Preferences Detail"
          meta="bottom sheet · new events"
          collapsible
          defaultOpen={false}
        >
          {data.jobPrefsDetail.map((row, idx) => (
            <Row
              key={row.key}
              index={idx + 1}
              label={row.label}
              users={row.users}
              denominator={data.main.find(s => s.key === "job_prefs_shown")?.users ?? totalStarted}
              prevUsers={idx > 0 ? data.jobPrefsDetail![idx - 1].users : undefined}
              barColor="#38bdf8"
              isNew
            />
          ))}
        </Section>
      )}

      {/* Build method detail — only when v3 backend */}
      {data.buildMethodDetail && (
        <Section
          title="Build Method Detail"
          meta="per-branch breakdown · new events"
          collapsible
          defaultOpen={false}
        >
          <Row
            index="B1"
            label={data.buildMethodDetail.screen.label}
            users={data.buildMethodDetail.screen.users}
            denominator={totalStarted}
            prevUsers={data.main.find(s => s.key === "template_selected")?.users}
            barColor="#a855f7"
            isNew
          />
          <Row
            index="B2"
            label={data.buildMethodDetail.selected.label}
            users={data.buildMethodDetail.selected.segments.reduce((a, b) => a + b.users, 0)}
            denominator={buildScreenUsers || totalStarted}
            prevUsers={data.buildMethodDetail.screen.users}
            segments={data.buildMethodDetail.selected.segments}
            isNew
          />

          {/* Branch sub-rows — Quick AI */}
          <div className="py-3">
            <p className="text-xs font-semibold mb-2 pl-8" style={{ color: "var(--text-muted)" }}>
              Quick AI
            </p>
            {data.buildMethodDetail.quickAi.map((r, idx) => (
              <Row key={r.key} label={r.label} users={r.users}
                denominator={data.buildMethodDetail!.selected.segments.find(s => s.key === "quick")?.users ?? buildScreenUsers}
                prevUsers={idx > 0 ? data.buildMethodDetail!.quickAi[idx - 1].users : undefined}
                barColor="#6366f1" isNew />
            ))}
          </div>

          {/* LinkedIn */}
          <div className="py-3">
            <p className="text-xs font-semibold mb-2 pl-8" style={{ color: "var(--text-muted)" }}>
              LinkedIn Import
            </p>
            {data.buildMethodDetail.linkedin.map((r, idx) => (
              <Row key={r.key} label={r.label} users={r.users}
                denominator={data.buildMethodDetail!.selected.segments.find(s => s.key === "linkedin")?.users ?? buildScreenUsers}
                prevUsers={idx > 0 ? data.buildMethodDetail!.linkedin[idx - 1].users : undefined}
                barColor="#22d3ee" isNew />
            ))}
          </div>

          {/* Upload */}
          <div className="py-3">
            <p className="text-xs font-semibold mb-2 pl-8" style={{ color: "var(--text-muted)" }}>
              Resume Upload
            </p>
            {data.buildMethodDetail.upload.map((r, idx) => (
              <Row key={r.key} label={r.label} users={r.users}
                denominator={data.buildMethodDetail!.selected.segments.find(s => s.key === "upload")?.users ?? buildScreenUsers}
                prevUsers={idx > 0 ? data.buildMethodDetail!.upload[idx - 1].users : undefined}
                barColor="#f59e0b" isNew />
            ))}
          </div>
        </Section>
      )}

      {/* Review & Download branch */}
      <Section title="Review & Download" meta={`${fmt(data.editBranch.cohortSize)} in cohort`}>
        {data.editBranch.steps.map((step, idx) => (
          <Row
            key={step.key}
            index={`${idx + 1}`}
            label={step.label}
            users={step.users}
            denominator={editCohortSize}
            prevUsers={idx === 0 ? editCohortSize : data.editBranch.steps[idx - 1].users}
            barColor="#f59e0b"
          />
        ))}
        <Row
          index={data.editBranch.steps.length + 1}
          label={data.editBranch.savePromptShown.label}
          users={data.editBranch.savePromptShown.users}
          denominator={editCohortSize}
          prevUsers={data.editBranch.steps[data.editBranch.steps.length - 1]?.users ?? editCohortSize}
          barColor="#f59e0b"
        />
        <Row
          index={data.editBranch.steps.length + 2}
          label={data.editBranch.signInOutcomes.label}
          users={data.editBranch.signInOutcomes.segments.reduce((a, b) => a + b.users, 0)}
          denominator={data.editBranch.savePromptShown.users || editCohortSize}
          prevUsers={data.editBranch.savePromptShown.users}
          segments={data.editBranch.signInOutcomes.segments}
        />
        <Row
          index={data.editBranch.steps.length + 3}
          label={data.editBranch.finalActions.label}
          users={data.editBranch.finalActions.segments.reduce((a, b) => a + b.users, 0)}
          denominator={editCohortSize}
          segments={data.editBranch.finalActions.segments}
        />
      </Section>

      {/* Terminal outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          {
            label: "Left via Sign-in",
            value: data.endings.leftViaSignIn,
            color: "#f59e0b",
            desc: "Attempted sign-in inside R&D; did not reach a final action.",
          },
          {
            label: "Completed a final action",
            value: data.endings.finalAction,
            color: "#10b981",
            desc: "Shared, downloaded, or closed the final resume preview.",
          },
        ].map(e => {
          const w = pct(e.value, editCohortSize);
          return (
            <div key={e.label} className="rounded-xl p-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{e.label}</p>
                <p className="text-xl font-bold tabular-nums" style={{ color: e.color }}>{fmt(e.value)}</p>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2"
                style={{ background: "var(--bg-secondary)" }}>
                <div className="h-full rounded-full" style={{ width: `${w}%`, background: e.color }} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: e.color, fontWeight: 600 }}>{w}%</span> of R&D cohort · {e.desc}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}