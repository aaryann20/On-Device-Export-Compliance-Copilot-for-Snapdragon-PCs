import { useState } from "react";

const TABS = [
  { id: "qa", label: "Document Q&A" },
  { id: "hs", label: "HS Classification" },
  { id: "rpl", label: "Restricted-Party Screening" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [tab, setTab] = useState<TabId>("qa");

  return (
    <div className="min-h-svh bg-page text-slate-900">
      <header className="border-b border-slate-200 bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">
              CrossWise · On-device
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Export-compliance copilot
            </h1>
            <p className="mt-1 text-sm text-white/75">
              Documents stay on this machine. No cloud LLM.
            </p>
          </div>
          <p className="text-xs text-white/60">Scaffold — tabs only</p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-6">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === item.id
                  ? "border-white text-white"
                  : "border-transparent text-white/65 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">
            {TABS.find((item) => item.id === tab)?.label}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Placeholder. This tab will be wired to the local FastAPI backend in a
            later step.
          </p>
        </section>
      </main>
    </div>
  );
}
