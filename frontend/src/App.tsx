import { useState, useEffect } from "react";
import {
  Shield,
  FileText,
  Search,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Send,
  Sparkles,
  RefreshCw,
  Lock,
  Zap,
  Database,
  Sliders,
  Layers,
  Columns,
  Printer,
  Command
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

type TabId = "qa" | "hs" | "tpp" | "bom" | "rpl" | "system";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("qa");
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "online" | "offline">("connecting");

  // Global Command Palette state
  const [showCmdK, setShowCmdK] = useState(false);
  const [cmdSearch, setCmdSearch] = useState("");

  // Document Q&A State & Split Screen
  const [qaQuery, setQaQuery] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResponse, setQaResponse] = useState<any>(null);
  const [qaDocuments, setQaDocuments] = useState<any[]>([]);
  const [selectedDocText, setSelectedDocText] = useState<string>("");
  const [splitView, setSplitView] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Internal Export Policy");
  const [uploadContent, setUploadContent] = useState("");

  // Classification State
  const [classDescription, setClassDescription] = useState("");
  const [classLoading, setClassLoading] = useState(false);
  const [classResult, setClassResult] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);

  // TPP Calculator State
  const [calcTops, setCalcTops] = useState<number>(45);
  const [calcBitWidth, setCalcBitWidth] = useState<number>(8);
  const [calcBandwidth, setCalcBandwidth] = useState<number>(300);
  const [calcDieArea, setCalcDieArea] = useState<number>(120);
  const [tppResult, setTppResult] = useState<any>(null);

  // Batch BOM State
  const [bomResult, setBomResult] = useState<any>(null);

  // Restricted-Party Screening State
  const [screenName, setScreenName] = useState("");
  const [screenCountry, setScreenCountry] = useState("");
  const [screenType, setScreenType] = useState("Organization");
  const [screenLoading, setScreenLoading] = useState(false);
  const [screenResult, setScreenResult] = useState<any>(null);

  // Modal Printable Cert
  const [showCertModal, setShowCertModal] = useState(false);
  const [certType, setCertType] = useState<"rpl" | "ear_statement" | "nac_form">("rpl");

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCmdK((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchMetrics();
    fetchDocuments();
    fetchPresets();
    handleCalculateTpp(45, 8, 300, 120);
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/system/metrics`);
      if (res.ok) {
        const data = await res.json();
        setSystemMetrics(data);
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/qa/documents`);
      if (res.ok) {
        const data = await res.json();
        setQaDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDocText(data.documents[0].title);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/classify/presets`);
      if (res.ok) {
        const data = await res.json();
        setPresets(data.presets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Q&A Ask
  const handleAsk = async (queryToAsk?: string) => {
    const q = queryToAsk || qaQuery;
    if (!q.trim()) return;
    setQaLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/qa/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const data = await res.json();
        setQaResponse(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQaLoading(false);
    }
  };

  // Upload Doc
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadContent) return;
    try {
      const res = await fetch(`${API_BASE}/api/qa/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          category: uploadCategory,
          content: uploadContent
        }),
      });
      if (res.ok) {
        await fetchDocuments();
        setShowUploadModal(false);
        setUploadTitle("");
        setUploadContent("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Classify Product
  const handleClassify = async (descToClassify?: string) => {
    const desc = descToClassify || classDescription;
    if (!desc.trim()) return;
    setClassLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/classify/hs-eccn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });
      if (res.ok) {
        const data = await res.json();
        setClassResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClassLoading(false);
    }
  };

  // TPP Calculation
  const handleCalculateTpp = async (
    tops: number,
    bitWidth: number,
    bandwidth: number,
    dieArea: number
  ) => {
    try {
      const res = await fetch(`${API_BASE}/api/classify/calculate-tpp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tops,
          bit_width: bitWidth,
          interconnect_gbps: bandwidth,
          die_area_mm2: dieArea
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTppResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Batch BOM Scan
  const handleScanBom = async (items: any[]) => {
    try {
      const res = await fetch(`${API_BASE}/api/classify/batch-bom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        const data = await res.json();
        setBomResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Screening Search
  const handleScreen = async (nameToScreen?: string, countryToScreen?: string) => {
    const name = nameToScreen !== undefined ? nameToScreen : screenName;
    const country = countryToScreen !== undefined ? countryToScreen : screenCountry;
    if (!name.trim()) return;
    setScreenLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/screening/screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          country,
          entity_type: screenType
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScreenResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScreenLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  CrossWise
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                    v1.0 On-Device
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Snapdragon AI Lab Build & Present Challenge · Export-Compliance Copilot
              </p>
            </div>
          </div>

          {/* Controls & Command Palette Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCmdK(true)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 transition"
            >
              <Command className="h-3.5 w-3.5 text-indigo-400" />
              <span>Search & Commands</span>
              <kbd className="hidden sm:inline-block bg-slate-900 border border-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-full px-3 py-1.5 text-xs text-slate-300">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>Hexagon NPU</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-xs font-medium ${
              backendStatus === "online"
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-rose-950/60 border-rose-800 text-rose-300"
            }`}>
              <span className={`h-2 w-2 rounded-full ${backendStatus === "online" ? "bg-emerald-400" : "bg-rose-400"}`}></span>
              <span>{backendStatus === "online" ? "FastAPI Live" : "Disconnected"}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-slate-800/80 pt-1">
          <button
            onClick={() => setActiveTab("qa")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === "qa"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Document Q&A RAG
          </button>

          <button
            onClick={() => setActiveTab("hs")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === "hs"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="h-4 w-4" />
            HS & ECCN Classifier
          </button>

          <button
            onClick={() => setActiveTab("tpp")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === "tpp"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="h-4 w-4" />
            ECCN TPP Calculator
          </button>

          <button
            onClick={() => setActiveTab("bom")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === "bom"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            Batch BOM Scanner
          </button>

          <button
            onClick={() => setActiveTab("rpl")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === "rpl"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="h-4 w-4" />
            Restricted Party Screening
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === "system"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="h-4 w-4" />
            System Monitor
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= TAB 1: DOCUMENT Q&A RAG ================= */}
        {activeTab === "qa" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Regulatory & Export Policy Knowledge Engine
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Local RAG index for EAR 15 CFR Part 774 (ECCN 3A090), ITAR 22 CFR Part 121 (Cat XI), OFAC 31 CFR, Snapdragon Hardware Specs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSplitView(!splitView)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition ${
                    splitView
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                      : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <Columns className="h-4 w-4" />
                  {splitView ? "Close Split View" : "Split Reader View"}
                </button>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                >
                  <Upload className="h-4 w-4" />
                  Upload Regulation Doc
                </button>
              </div>
            </div>

            {/* Split Screen Layout or Standard Layout */}
            <div className={`grid gap-6 ${splitView ? "lg:grid-cols-12" : "grid-cols-1"}`}>
              {/* Document Split Viewer Column */}
              {splitView && (
                <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Regulation Text Viewer</span>
                    <span className="text-[10px] text-indigo-400 font-mono">100% Local File Reader</span>
                  </h3>
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {qaDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocText(doc.title)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                          selectedDocText === doc.title
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {doc.title.split("-")[0]}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-[450px] overflow-y-auto font-mono text-xs text-slate-300 space-y-3">
                    <p className="font-bold text-indigo-300">{selectedDocText || "EAR 15 CFR Part 774 Supplement No. 1"}</p>
                    <p className="leading-relaxed text-slate-400">
                      [Full Legal Text Segment] Section 3A090 controls Integrated circuits having any of the following:
                    </p>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <p className="text-emerald-400 font-semibold">a. Processing Performance (TPP):</p>
                      <p className="text-slate-300">
                        Integrated circuits having one or more processing units having a Total Processing Performance (TPP) of 4800 or more, OR a TPP of 1600 or more AND a performance density of 5.92 or more.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <p className="text-amber-400 font-semibold">b. Interconnect Bandwidth:</p>
                      <p className="text-slate-300">
                        Primary processing units having interconnect bandwidth of 600 GB/s or more. Exporters must submit a prior notification 25 days before commercial release.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Q&A Column */}
              <div className={`${splitView ? "lg:col-span-7" : "w-full"} space-y-6`}>
                {/* Query Form */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={qaQuery}
                        onChange={(e) => setQaQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                        placeholder="Ask export control query (e.g., 'What are the limits for 3A090 high performance chips?')..."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      {qaLoading && (
                        <div className="absolute right-3 top-3.5">
                          <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAsk()}
                      disabled={qaLoading}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Inquire NPU
                    </button>
                  </div>

                  {/* Preset Query Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" /> Suggested Queries:
                    </span>
                    {[
                      "What are the ECCN 3A090 performance limits?",
                      "Can Snapdragon NPU ship under License Exception ENC?",
                      "What is the OFAC 50 Percent Rule?",
                      "When does ITAR Category XI apply to microcircuits?"
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQaQuery(q);
                          handleAsk(q);
                        }}
                        className="text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white px-3 py-1 rounded-lg transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Card */}
                {qaResponse && (
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/80 space-y-6 glow-indigo">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="text-xs text-indigo-400 font-mono flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5" />
                          Inference Engine: {qaResponse.device} ({qaResponse.latency_ms} ms)
                        </div>
                        <h3 className="text-base font-semibold text-white mt-1">
                          Query Result: "{qaResponse.query}"
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Compliance Risk:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          qaResponse.risk_level === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : qaResponse.risk_level === "HIGH"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}>
                          {qaResponse.risk_level}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        On-Device Legal & Technical Synthesis:
                      </h4>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">
                        {qaResponse.answer}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-indigo-400" /> Cited Source Regulations & Clauses:
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {qaResponse.citations.map((cite: any, i: number) => (
                          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-indigo-300">{cite.category}</span>
                              <span className="text-emerald-400 font-mono text-[11px]">Match: {cite.confidence}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium">{cite.document}</p>
                            <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                              "{cite.clause}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: HS & ECCN CLASSIFIER ================= */}
        {activeTab === "hs" && (
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-indigo-400" />
                Automated Trade & Export Control Classifier
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter hardware specifications to determine 10-digit Harmonized System (HS) code, Export Control Classification Number (ECCN), and license eligibility.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">Product Spec Input</h3>
                <textarea
                  rows={5}
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Paste component datasheet specs (e.g. 'Octa-core ARM v9 SoC with integrated NPU 45 TOPS, AES-256 hardware crypto engine, PCIe Gen4 interface...')"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={() => handleClassify()}
                  disabled={classLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {classLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Determine HS Code & ECCN
                </button>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Database className="h-3.5 w-3.5 text-indigo-400" /> Quick Hardware Presets:
                  </span>
                  <div className="grid gap-2">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setClassDescription(p.description);
                          handleClassify(p.description);
                        }}
                        className="text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition group"
                      >
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                            {p.eccn}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          HS: {p.hs_code} · {p.category}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result Pane */}
              <div className="lg:col-span-7 space-y-4">
                {classResult ? (
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/80 space-y-6 glow-indigo">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs text-indigo-400 font-mono">Classification Complete</span>
                        <h3 className="text-base font-bold text-white mt-0.5">{classResult.product_name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Confidence Score</span>
                        <div className="text-sm font-mono font-bold text-emerald-400">{classResult.confidence}%</div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Harmonized System (HS) Code:
                        </span>
                        <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
                          {classResult.hs_code}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          {classResult.hs_description}
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Export Control Number (ECCN):
                        </span>
                        <div className="text-xl font-bold font-mono text-amber-400 mt-1 flex items-center justify-between">
                          <span>{classResult.eccn}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-sans ${
                            classResult.dual_use_risk === "CRITICAL" ? "bg-rose-500/20 text-rose-300" :
                            classResult.dual_use_risk === "HIGH" ? "bg-amber-500/20 text-amber-300" :
                            "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            {classResult.dual_use_risk} RISK
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          {classResult.ccl_category}
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                        <span className="font-semibold text-slate-300 block mb-1">Reasons for Control:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {classResult.control_reasons?.map((r: string, idx: number) => (
                            <span key={idx} className="bg-slate-950 text-slate-300 px-2 py-1 rounded border border-slate-800 font-mono">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                        <span className="font-semibold text-slate-300 block mb-1">License Exemption Eligibility:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {classResult.license_exceptions?.map((ex: string, idx: number) => (
                            <span key={idx} className="bg-indigo-950 text-indigo-300 px-2 py-1 rounded border border-indigo-800">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCertType("ear_statement");
                        setShowCertModal(true);
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                    >
                      <Printer className="h-4 w-4" />
                      Generate Destination Control Statement (EAR § 758.6)
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center text-slate-500 min-h-[350px]">
                    <Search className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-400">No Product Classified Yet</p>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Type product specs or pick a preset on the left to run classification.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ECCN TPP CALCULATOR ================= */}
        {activeTab === "tpp" && (
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-400" />
                ECCN 3A090 Total Processing Performance (TPP) & Density Calculator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Interactive hardware slider wizard for calculating TPP (2 × TOPS × BitLength) and Performance Density (TPP / Die Area mm²) per US BIS ECCN 3A090.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Sliders Form */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
                <h3 className="text-sm font-semibold text-white">Hardware Parameter Sliders</h3>

                {/* TOPS Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Peak Compute TOPS:</span>
                    <span className="text-indigo-400 font-mono">{calcTops} TOPS</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={5000}
                    step={5}
                    value={calcTops}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCalcTops(val);
                      handleCalculateTpp(val, calcBitWidth, calcBandwidth, calcDieArea);
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>5 TOPS (Edge NPU)</span>
                    <span>5000 TOPS (HPC GPU)</span>
                  </div>
                </div>

                {/* Bit Width Selector */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Processing MacOps Bit Width:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "8-bit (INT8)", val: 8 },
                      { label: "16-bit (FP16)", val: 16 },
                      { label: "32-bit (FP32)", val: 32 }
                    ].map((b) => (
                      <button
                        key={b.val}
                        onClick={() => {
                          setCalcBitWidth(b.val);
                          handleCalculateTpp(calcTops, b.val, calcBandwidth, calcDieArea);
                        }}
                        className={`py-2 rounded-xl text-xs font-medium border transition ${
                          calcBitWidth === b.val
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interconnect Bandwidth Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Interconnect Bandwidth (GB/s):</span>
                    <span className="text-indigo-400 font-mono">{calcBandwidth} GB/s</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1200}
                    step={25}
                    value={calcBandwidth}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCalcBandwidth(val);
                      handleCalculateTpp(calcTops, calcBitWidth, val, calcDieArea);
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>50 GB/s (PCIe)</span>
                    <span>1200 GB/s (NVLink)</span>
                  </div>
                </div>

                {/* Die Area Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Silicon Die Area (mm²):</span>
                    <span className="text-indigo-400 font-mono">{calcDieArea} mm²</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={1000}
                    step={10}
                    value={calcDieArea}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCalcDieArea(val);
                      handleCalculateTpp(calcTops, calcBitWidth, calcBandwidth, val);
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Preset Chips */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Preset Hardware Calculations:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCalcTops(45); setCalcBitWidth(8); setCalcBandwidth(300); setCalcDieArea(120);
                        handleCalculateTpp(45, 8, 300, 120);
                      }}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="font-semibold text-slate-200">Snapdragon NPU</div>
                      <div className="text-[10px] text-slate-400">45 TOPS · 720 TPP</div>
                    </button>

                    <button
                      onClick={() => {
                        setCalcTops(2500); setCalcBitWidth(16); setCalcBandwidth(900); setCalcDieArea(814);
                        handleCalculateTpp(2500, 16, 900, 814);
                      }}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="font-semibold text-slate-200">Datacenter ASIC</div>
                      <div className="text-[10px] text-slate-400">2500 TOPS · 80000 TPP</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live TPP Result Card */}
              <div className="lg:col-span-7 space-y-4">
                {tppResult && (
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/80 space-y-6 glow-indigo">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs text-indigo-400 font-mono">ECCN Decision Tree Output</span>
                        <h3 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                          Calculated ECCN: <span className="text-indigo-300 font-mono">{tppResult.eccn}</span>
                        </h3>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        tppResult.risk_level === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                        tppResult.risk_level === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {tppResult.risk_level} CONTROL
                      </span>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Total Processing Performance (TPP):
                        </span>
                        <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
                          {tppResult.tpp} TPP
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full ${tppResult.tpp >= 4800 ? "bg-rose-500" : "bg-emerald-400"}`}
                            style={{ width: `${Math.min(100, (tppResult.tpp / 4800) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          3A090 Control Limit: 4800 TPP ({tppResult.tpp_threshold_4800_pct}% reached)
                        </span>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Performance Density (TPP / mm²):
                        </span>
                        <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                          {tppResult.performance_density}
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full ${tppResult.performance_density >= 5.92 ? "bg-amber-500" : "bg-emerald-400"}`}
                            style={{ width: `${Math.min(100, (tppResult.performance_density / 5.92) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          3A090 Control Density Limit: 5.92 ({tppResult.density_threshold_592_pct}% reached)
                        </span>
                      </div>
                    </div>

                    {/* Governing Rule */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Regulatory Determination:
                      </h4>
                      <p className="text-sm text-slate-200 leading-relaxed font-medium">
                        {tppResult.governing_rule}
                      </p>
                      <p className="text-xs text-indigo-300 font-mono pt-1">
                        Requirement: {tppResult.license_requirement}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCertType("nac_form");
                        setShowCertModal(true);
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                    >
                      <Printer className="h-4 w-4" />
                      Generate BIS License Exception NAC Form
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: BATCH BOM SCANNER ================= */}
        {activeTab === "bom" && (
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                Batch Bill of Materials (BOM) & Hardware System Scanner
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Scan multi-component hardware assemblies to determine governing overall system ECCN and license requirements.
              </p>
            </div>

            {/* Presets and Upload */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-white">Select System Hardware BOM Preset:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleScanBom([
                    { part_number: "QUAL-NPU-01", name: "Snapdragon Hexagon NPU", description: "45 TOPS INT8 AI accelerator chip", quantity: 1 },
                    { part_number: "MEM-LPDDR-16", name: "16GB LPDDR5 Memory IC", description: "Standard RAM chip", quantity: 2 },
                    { part_number: "WIFI-RF-7", name: "Wi-Fi 7 Transceiver Subsystem", description: "AES-256 hardware crypto wireless chip", quantity: 1 }
                  ])}
                  className="p-4 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left space-y-1 transition group"
                >
                  <div className="font-bold text-slate-200 group-hover:text-indigo-300 text-sm">
                    Snapdragon AI Robot Copilot System BOM
                  </div>
                  <p className="text-xs text-slate-400">3 Parts · Commercial Edge Robotics Platform</p>
                </button>

                <button
                  onClick={() => handleScanBom([
                    { part_number: "ASIC-HPC-99", name: "UltraCompute AI Accelerator ASIC", description: "5120 TOPS NVLink high performance chip", quantity: 8 },
                    { part_number: "DRONE-IMU-88", name: "Tactical MEMS IMU Telemetry Module", description: "Military grade 10000g shock resistant sensor", quantity: 2 },
                    { part_number: "WIFI-RF-7", name: "Encrypted Transceiver Subsystem", description: "WPA3 security chip", quantity: 4 }
                  ])}
                  className="p-4 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left space-y-1 transition group"
                >
                  <div className="font-bold text-slate-200 group-hover:text-amber-300 text-sm">
                    Autonomous Tactical Drone System BOM
                  </div>
                  <p className="text-xs text-slate-400">3 Parts · High Compute & Military Navigation Sensors</p>
                </button>
              </div>
            </div>

            {/* Scan Results */}
            {bomResult && (
              <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/80 space-y-6 glow-indigo">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-indigo-400 font-mono">BOM System Export Assessment</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Governing System ECCN: <span className="text-amber-400 font-mono">{bomResult.governing_system_eccn}</span>
                    </h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    bomResult.overall_system_risk === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                    bomResult.overall_system_risk === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}>
                    {bomResult.overall_system_risk} SYSTEM RISK
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-medium">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">System Licensing Assessment:</span>
                  {bomResult.system_license_recommendation}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                        <th className="pb-2">Part No</th>
                        <th className="pb-2">Component Name</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2">HS Code</th>
                        <th className="pb-2">ECCN</th>
                        <th className="pb-2">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {bomResult.components.map((c: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/60">
                          <td className="py-3 font-mono text-slate-400">{c.part_number}</td>
                          <td className="py-3 font-semibold text-slate-200">{c.name}</td>
                          <td className="py-3 font-mono text-slate-300">{c.quantity}</td>
                          <td className="py-3 font-mono text-indigo-300">{c.hs_code}</td>
                          <td className="py-3 font-mono text-amber-400 font-bold">{c.eccn}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              c.risk_level === "CRITICAL" ? "bg-rose-500/20 text-rose-300" :
                              c.risk_level === "HIGH" ? "bg-amber-500/20 text-amber-300" :
                              "bg-emerald-500/20 text-emerald-300"
                            }`}>
                              {c.risk_level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: RESTRICTED-PARTY SCREENING ================= */}
        {activeTab === "rpl" && (
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" />
                Restricted-Party & Consolidated Screening List (CSL) Copilot
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time on-device screening against US BIS Entity List, OFAC SDN, Denied Persons List (DPL), and Unverified List (UVL).
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">Party Search Details</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Individual / Entity Name *</label>
                    <input
                      type="text"
                      value={screenName}
                      onChange={(e) => setScreenName(e.target.value)}
                      placeholder="e.g., Global Tech Imports LLC"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Country Jurisdiction</label>
                      <input
                        type="text"
                        value={screenCountry}
                        onChange={(e) => setScreenCountry(e.target.value)}
                        placeholder="e.g., China, UAE, Russia"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Entity Category</label>
                      <select
                        value={screenType}
                        onChange={(e) => setScreenType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Organization">Organization / Entity</option>
                        <option value="Individual">Individual</option>
                        <option value="Vessel">Vessel / Aircraft</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleScreen()}
                  disabled={screenLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {screenLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Execute Screening Search
                </button>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Database className="h-3.5 w-3.5 text-indigo-400" /> Presets for Audit Demo:
                  </span>
                  <div className="grid gap-2">
                    {[
                      { name: "Global Tech Imports LLC", country: "China", badge: "FLAGGED (Entity List)" },
                      { name: "AeroDynamics Trans Trading FZE", country: "United Arab Emirates", badge: "FLAGGED (OFAC SDN)" },
                      { name: "Apex Semiconductor Solutions", country: "Taiwan", badge: "WARNING (UVL)" },
                      { name: "Orion Avionics & Wireless Systems Ltd", country: "United Kingdom", badge: "CLEAR (Commercial)" }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setScreenName(item.name);
                          setScreenCountry(item.country);
                          handleScreen(item.name, item.country);
                        }}
                        className="text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-medium text-slate-200">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.country}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          item.badge.includes("FLAGGED") ? "bg-rose-500/20 text-rose-300" :
                          item.badge.includes("WARNING") ? "bg-amber-500/20 text-amber-300" :
                          "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {item.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Pane */}
              <div className="lg:col-span-7 space-y-4">
                {screenResult ? (
                  <div className={`glass-panel p-6 rounded-2xl border bg-slate-900/80 space-y-6 ${
                    screenResult.badge_color === "red" ? "border-rose-500/40 glow-rose" :
                    screenResult.badge_color === "amber" ? "border-amber-500/40 glow-amber" :
                    "border-emerald-500/40 glow-emerald"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="text-xs text-slate-400 font-mono">Audit Log ID: {screenResult.audit_id}</div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          Screening Result: {screenResult.query_name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {screenResult.badge_color === "red" && <XCircle className="h-6 w-6 text-rose-500" />}
                        {screenResult.badge_color === "amber" && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                        {screenResult.badge_color === "green" && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          screenResult.badge_color === "red" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                          screenResult.badge_color === "amber" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}>
                          {screenResult.screening_status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Action Recommendation:
                      </span>
                      <p className="text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                        {screenResult.recommendation}
                      </p>
                    </div>

                    {screenResult.cert_hash && (
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between text-indigo-300">
                        <span>Digital Audit Signature:</span>
                        <span>{screenResult.cert_hash}</span>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Matched CSL Restricted Records ({screenResult.matches.length}):
                      </h4>
                      {screenResult.matches.length > 0 ? (
                        <div className="space-y-3">
                          {screenResult.matches.map((m: any, i: number) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-rose-400">{m.list_source}</span>
                                <span className="font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                  Match: {m.match_confidence}%
                                </span>
                              </div>
                              <div className="text-sm font-semibold text-white">{m.entity_name}</div>
                              <p className="text-xs text-slate-400">{m.address} ({m.country})</p>
                              <div className="bg-slate-950/80 p-2 rounded text-[11px] text-slate-300 font-mono border border-slate-800">
                                {m.notes}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Zero matching restricted names found across CSL database.
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      <span className="text-xs text-slate-400 font-mono">
                        Scanned {screenResult.csl_records_scanned} records in {screenResult.latency_ms} ms
                      </span>
                      <button
                        onClick={() => {
                          setCertType("rpl");
                          setShowCertModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                      >
                        <Printer className="h-4 w-4" /> Download Printable Audit Certificate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center text-slate-500 min-h-[350px]">
                    <Shield className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-400">Ready for Party Screening</p>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Enter party details or click a preset on the left to perform fuzzy CSL screening.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SYSTEM & NPU MONITOR ================= */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-400" />
                Snapdragon NPU On-Device Monitor & Telemetry
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time local hardware compute performance, memory allocation, and zero-cloud privacy architecture.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Hardware Target</span>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-emerald-400" /> Snapdragon Hexagon
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">Tensor Direct ML Active</span>
              </div>

              <div className="glass-card p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">NPU Utilization</span>
                <div className="text-xl font-bold text-white font-mono">
                  {systemMetrics?.npu_utilization_pct || 14.2} %
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${systemMetrics?.npu_utilization_pct || 14.2}%` }}
                  ></div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Local Memory Usage</span>
                <div className="text-xl font-bold text-white font-mono">
                  {systemMetrics?.memory_used_mb || 412} MB / {Math.round((systemMetrics?.memory_total_mb || 16384) / 1024)} GB
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Zero Cloud Offload</span>
              </div>

              <div className="glass-card p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium">Avg Execution Latency</span>
                <div className="text-xl font-bold text-indigo-300 font-mono">
                  {systemMetrics?.avg_latency_ms || 11.4} ms
                </div>
                <span className="text-[11px] text-indigo-400 font-mono">Ultra-Low Latency</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-400" />
                On-Device Privacy & Export Protection Guarantees
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> 100% Offline Model Weights
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Vector retrieval, regulation embeddings, and classification heuristics execute entirely on the local device processor.
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Zero Network Egress
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Customer technical specifications, proprietary source code, and trade invoices never cross any network boundary.
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Audit Certificate Integrity
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generates cryptographically signed audit logs for EAR/ITAR compliance officers with timestamps and SHA-256 hashes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Command Palette Modal (Cmd+K) */}
      {showCmdK && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="glass-panel max-w-xl w-full rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Command className="h-5 w-5 text-indigo-400" />
              <input
                type="text"
                autoFocus
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                placeholder="Type command or jump to feature (e.g. '3A090', 'BOM', 'Screening', 'Calculate TPP')..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
              />
              <button onClick={() => setShowCmdK(false)} className="text-xs text-slate-400 hover:text-white">
                ESC
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              {[
                { title: "Document Q&A RAG Assistant", cat: "Tab Navigation", action: () => { setActiveTab("qa"); setShowCmdK(false); } },
                { title: "HS Code & ECCN Classifier", cat: "Tab Navigation", action: () => { setActiveTab("hs"); setShowCmdK(false); } },
                { title: "ECCN 3A090 TPP & Density Calculator", cat: "Tools", action: () => { setActiveTab("tpp"); setShowCmdK(false); } },
                { title: "Batch Bill of Materials (BOM) Scanner", cat: "Tools", action: () => { setActiveTab("bom"); setShowCmdK(false); } },
                { title: "Restricted Party Screening (CSL)", cat: "Tab Navigation", action: () => { setActiveTab("rpl"); setShowCmdK(false); } },
                { title: "Snapdragon NPU Monitor", cat: "Telemetry", action: () => { setActiveTab("system"); setShowCmdK(false); } },
              ]
                .filter((item) => !cmdSearch || item.title.toLowerCase().includes(cmdSearch.toLowerCase()))
                .map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 transition flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200">{item.title}</span>
                    <span className="text-[10px] text-indigo-400 font-mono bg-slate-950 px-2 py-0.5 rounded">
                      {item.cat}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Custom Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-400" /> Upload Export Regulation / Policy
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. EAR 15 CFR Part 740 License Exceptions"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  placeholder="e.g. EAR / ITAR / Internal Policy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Document Text / Clauses *</label>
                <textarea
                  required
                  rows={6}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste legal text, export controls, or internal compliance rules here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Index into Local NPU Vector RAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Certificate & Export Form Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-2xl border border-indigo-500/40 bg-slate-900 text-slate-100 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Printer className="h-6 w-6 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {certType === "rpl" && "Restricted Party Screening Audit Certificate"}
                    {certType === "ear_statement" && "Commercial Invoice Destination Control Statement (EAR § 758.6)"}
                    {certType === "nac_form" && "BIS License Exception NAC Prior-Notification Form"}
                  </h3>
                  <p className="text-xs text-slate-400">Cryptographically signed on Snapdragon Local Engine</p>
                </div>
              </div>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            {/* Certificate Preview Body */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs space-y-4 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-3 text-indigo-400 font-bold">
                <span>CROSSWISE ON-DEVICE EXPORT COMPLIANCE</span>
                <span>OFFICIAL AUDIT DOC</span>
              </div>

              {certType === "rpl" && (
                <>
                  <p><strong>Party Name:</strong> {screenResult?.query_name || "Global Tech Imports LLC"}</p>
                  <p><strong>Jurisdiction:</strong> {screenResult?.query_country || "China"}</p>
                  <p><strong>Screening Status:</strong> <span className="text-emerald-400 font-bold">{screenResult?.screening_status || "CLEAR / NO MATCHES"}</span></p>
                  <p><strong>Recommendation:</strong> {screenResult?.recommendation || "Proceed with standard commercial export."}</p>
                  <p><strong>Digital Signature:</strong> {screenResult?.cert_hash || "SHA256:7f8a10bc9e0012f4...4192bc80"}</p>
                </>
              )}

              {certType === "ear_statement" && (
                <div className="space-y-2">
                  <p className="text-amber-400 font-bold">DESTINATION CONTROL STATEMENT (15 CFR § 758.6):</p>
                  <p className="leading-relaxed italic bg-slate-900 p-3 rounded border border-slate-800">
                    "These items are controlled by the U.S. Government and authorized for export only to the country of ultimate destination for use by the ultimate consignee or end-user(s) herein identified. They may not be resold, transferred, or otherwise disposed of, to any other country or to any person other than the authorized ultimate consignee..."
                  </p>
                </div>
              )}

              {certType === "nac_form" && (
                <div className="space-y-2">
                  <p className="text-indigo-300 font-bold">BIS LICENSE EXCEPTION NAC PRIOR NOTIFICATION SUMMARY:</p>
                  <p><strong>ECCN:</strong> 3A090.a Advanced Computing</p>
                  <p><strong>Total Processing Performance:</strong> {tppResult?.tpp || 5120} TPP</p>
                  <p><strong>Notification Requirement:</strong> Exporter must submit 25-day prior notice via SNAP-R to BIS for Country Group D:1/D:4/D:5 exports.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
