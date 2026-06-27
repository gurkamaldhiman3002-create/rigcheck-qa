import Link from "next/link";

type WorkflowStage = {
  id: string;
  title: string;
  description: string;
  fields: string[];
};

type CapabilityBand = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  dark?: boolean;
};

const workflowStages: WorkflowStage[] = [
  {
    id: "01",
    title: "Inspect",
    description:
      "Record component checks, hardware condition, connections, configuration details, and inspection notes.",
    fields: ["Serial", "Inspector", "Inspection Status", "Notes"],
  },
  {
    id: "02",
    title: "Flag",
    description:
      "Document failures with category, severity, description, and supporting evidence.",
    fields: ["Defect Category", "Severity", "Description", "Status"],
  },
  {
    id: "03",
    title: "Rework",
    description:
      "Assign corrective work, record repair actions, and track builds awaiting resolution.",
    fields: ["Resolution Notes", "In Rework", "Owner", "Timestamp"],
  },
  {
    id: "04",
    title: "Verify",
    description:
      "Perform the final quality check and approve or reject the build for release.",
    fields: ["Passed", "Failed", "Rework Cleared", "Final Signoff"],
  },
];

const capabilities: CapabilityBand[] = [
  {
    id: "traceability",
    eyebrow: "Build Traceability",
    title: "Follow every build through its complete QA history.",
    description:
      "Serial numbers, inspection records, defect reports, technician actions, and final status remain connected in one searchable record.",
    bullets: ["Serial and asset tracking", "Hardware configuration snapshots", "Linked quality timeline per build"],
  },
  {
    id: "inspection",
    eyebrow: "Inspection Management",
    title: "Standardized inspections with accountable results.",
    description:
      "Technicians complete structured checkpoints, document findings, and submit clear pass or fail decisions.",
    bullets: ["Consistent status lifecycle", "Inspector accountability", "Operational notes with context"],
    dark: true,
  },
  {
    id: "defects",
    eyebrow: "Defect And Rework Control",
    title: "Turn failed inspections into trackable corrective actions.",
    description:
      "Supervisors can review defects, assign rework, monitor progress, and confirm that identified issues were resolved.",
    bullets: ["Defect category classification", "Severity and status tracking", "Resolution note audit trail"],
  },
  {
    id: "reporting",
    eyebrow: "Quality Reporting",
    title: "Operational visibility for supervisors.",
    description:
      "Monitor pass rates, recurring defect categories, inspection volume, open rework, and build-quality trends.",
    bullets: ["Pass and fail movement", "Open defect pressure", "Inspection throughput visibility"],
    dark: true,
  },
  {
    id: "operations-access",
    eyebrow: "Role-Based Operations",
    title: "The right tools for every responsibility.",
    description:
      "Use role-aware workflows for technicians, supervisors, and administrators without exposing unnecessary controls.",
    bullets: [
      "Technician: inspections and defect reporting",
      "Supervisor: review, assignment, verification, and reporting",
      "Administrator: users, permissions, and system oversight",
    ],
  },
];

function WorkflowCard({ stage }: { stage: WorkflowStage }) {
  return (
    <article className="relative rounded-2xl border border-white/20 bg-white/7 p-6 backdrop-blur-sm md:p-7">
      <p className="text-xs font-semibold tracking-[0.28em] text-cyan-300">{stage.id}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{stage.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{stage.description}</p>
      <ul className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-200">
        {stage.fields.map((field) => (
          <li key={field} className="rounded-lg border border-white/15 bg-white/7 px-3 py-2">
            {field}
          </li>
        ))}
      </ul>
    </article>
  );
}

function CapabilitySection({ capability }: { capability: CapabilityBand }) {
  const sectionClass = capability.dark
    ? "bg-[#0a1322] text-slate-100"
    : "bg-[#f6f2ea] text-slate-900";
  const mutedClass = capability.dark ? "text-slate-300" : "text-slate-700";
  const boxClass = capability.dark
    ? "border-white/15 bg-white/5"
    : "border-slate-200 bg-white";

  return (
    <section id={capability.id} className={`border-y ${capability.dark ? "border-slate-800" : "border-slate-200"} ${sectionClass}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-500">{capability.eyebrow}</p>
          <h3 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">{capability.title}</h3>
          <p className={`mt-5 max-w-2xl text-base leading-7 ${mutedClass}`}>{capability.description}</p>
        </div>

        <div className={`rounded-2xl border p-5 shadow-sm ${boxClass}`}>
          <div className="grid gap-3">
            {capability.bullets.map((bullet) => (
              <div key={bullet} className={`rounded-xl border px-4 py-3 text-sm ${boxClass}`}>
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicLandingPage() {
  return (
    <main className="text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f6f2ea]">
        <div className="grid-overlay pointer-events-none absolute inset-0 opacity-60" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">HARDWARE QUALITY OPERATIONS</p>
            <p className="mt-3 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900">
              Internal Quality Operations System
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.94] text-slate-950 sm:text-6xl lg:text-7xl">
              Quality control for every build.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
              RigCheck QA gives technicians and supervisors one operational workspace for inspections, defects, rework,
              final verification, and production-quality reporting.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="focus-ring rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Operations Dashboard
              </Link>
              <Link
                href="#platform"
                className="focus-ring rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                View QA Workflow
              </Link>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Authorized personnel only</p>
          </div>

          <div className="relative z-10">
            <div className="relative rounded-3xl border border-slate-200 bg-[#0b1425] p-4 shadow-2xl shadow-slate-900/20 sm:p-5">
              <div className="absolute -left-5 top-8 hidden h-28 w-28 rounded-full bg-cyan-400/15 blur-2xl lg:block" />
              <div className="absolute -right-8 bottom-8 hidden h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl lg:block" />

              <div className="rounded-2xl border border-white/10 bg-[#101b31] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">RigCheck QA Dashboard</p>
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
                    Live Example UI
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Builds Inspected Today</p>
                    <p className="mt-2 text-3xl font-semibold text-white">64</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Pass Rate</p>
                    <p className="mt-2 text-3xl font-semibold text-white">94.2%</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Open Defects</p>
                    <p className="mt-2 text-3xl font-semibold text-white">18</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Awaiting Rework</p>
                    <p className="mt-2 text-3xl font-semibold text-white">7</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs text-slate-300">Inspection Queue</p>
                  <div className="mt-3 space-y-2 text-xs text-slate-200">
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span>SN-02831 • RTX 4070 Build</span>
                      <span className="text-cyan-200">pending</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span>SN-02832 • QA Recheck</span>
                      <span className="text-amber-200">in_rework</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span>SN-02833 • Final Verify</span>
                      <span className="text-emerald-200">passed</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs text-slate-300">Final Verification</p>
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                    <span>Builds Ready For Release</span>
                    <span className="text-cyan-200">22</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f8f4ec]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 sm:grid-cols-2 lg:grid-cols-5">
            <p>Production QA</p>
            <p>Inspection Tracking</p>
            <p>Defect Escalation</p>
            <p>Rework Verification</p>
            <p>Role-Based Access</p>
          </div>
        </div>
      </section>

      <section id="operations" className="relative overflow-hidden border-b border-slate-800 bg-[#091326] text-white">
        <div className="grid-overlay pointer-events-none absolute inset-0 opacity-25" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">OPERATIONS</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">One record from assembly to final approval.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Each hardware build remains connected to its inspection history, detected defects, corrective actions,
              technician notes, and final QA decision. Supervisors can trace every step without relying on spreadsheets,
              paper logs, or scattered messages.
            </p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/7 p-5">
            <div className="rounded-2xl border border-white/10 bg-[#0f1c33] p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <p className="text-sm font-semibold">Build Quality Timeline</p>
                <span className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-[11px] text-cyan-200">Connected Records</span>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-slate-200">
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Inspection created by technician</li>
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">GPU defect flagged with severity</li>
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Rework action logged with notes</li>
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Final verification marked as passed</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-slate-800 bg-[#08101f] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">STANDARD QA WORKFLOW</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">A controlled process from inspection to release.</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workflowStages.map((stage) => (
              <WorkflowCard key={stage.id} stage={stage} />
            ))}
          </div>
        </div>
      </section>

      {capabilities.map((capability) => (
        <CapabilitySection key={capability.id} capability={capability} />
      ))}

      <section id="quality-metrics" className="border-b border-slate-800 bg-[#091326] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">PRODUCTION INSIGHTS</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">See where quality problems begin.</h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Use operational metrics to identify repeated failures, delayed rework, inspection bottlenecks, and
            build-quality patterns.
          </p>

          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/15 bg-white/7 p-4 lg:col-span-2">
              <p className="text-xs text-slate-300">Pass Rate And Inspection Activity</p>
              <div className="mt-5 space-y-3 text-xs text-slate-200">
                {[72, 80, 76, 89, 91, 94].map((value, index) => (
                  <div key={value + index} className="grid grid-cols-[44px_1fr_36px] items-center gap-2">
                    <span>W{index + 1}</span>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-cyan-300" style={{ width: `${value}%` }} />
                    </div>
                    <span>{value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/7 p-4 lg:col-span-3">
              <p className="text-xs text-slate-300">Defects By Category, Open Rework, Recurring Issues</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Builds Inspected", "64 today"],
                  ["Open Defects", "18 active"],
                  ["Awaiting Rework", "7 builds"],
                  ["Defects By Category", "GPU, Cooling, Wiring"],
                  ["Inspection Activity", "3 shifts tracked"],
                  ["Recurring Hardware Issues", "Power rail instability"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/15 bg-white/6 p-3">
                    <p className="text-xs text-slate-300">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f2ea]">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">SECURE EMPLOYEE ACCESS</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 lg:text-5xl">Continue to RigCheck QA operations.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-700">
            Sign in with an authorized technician, supervisor, or administrator account to access production records and
            workflow tools.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="focus-ring inline-flex items-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign In to RigCheck QA
            </Link>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Access is restricted to authorized personnel.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#efe8db]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-700 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="font-semibold uppercase tracking-[0.16em] text-slate-900">RigCheck QA</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-[0.12em]">
            <p>Internal Hardware Quality Operations</p>
            <p>System Status</p>
            <p>Privacy &amp; Security</p>
            <p>Authorized users only</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
