import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  ExternalLink,
  ChevronRight,
  Monitor,
  Activity,
  Terminal
} from "lucide-react";

interface StockData {
  name: string;
  data: any[];
  fields: string[];
  error?: boolean;
}

export default function App() {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stock-info");
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to fetch stock info", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = (sourceData: any[]) => {
    if (!searchTerm) return sourceData;
    return sourceData.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Maps data to specific sections based on name
  const punishData = data.find(d => d.name.includes("處置"));
  const noteData = data.find(d => d.name.includes("注意交易"));
  const tpexData = data.find(d => d.name.includes("上櫃"));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 overflow-hidden flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Market Surveillance <span className="text-sky-400">Terminal</span>
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">TWSE / TPEX Real-time Compliance Monitoring</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:block text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Market Status</div>
            <div className="flex items-center text-emerald-400 text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              SYSTEM ACTIVE
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-slate-800"></div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Last Sync</div>
            <div className="text-sm font-mono text-slate-300">{lastUpdated || "--:--:--"}</div>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Top Summary Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-sky-400 uppercase font-bold tracking-widest">Dispositioned / 處置</div>
            <div className="text-2xl font-bold font-mono mt-1 text-sky-50">{punishData?.data.length || 0}</div>
          </div>
          <div className="bg-sky-500/10 p-2 rounded-lg"><ShieldAlert className="w-5 h-5 text-sky-400" /></div>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">Notice / 注意</div>
            <div className="text-2xl font-bold font-mono mt-1 text-amber-50">{noteData?.data.length || 0}</div>
          </div>
          <div className="bg-amber-500/10 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">OTC Warnings / 上櫃</div>
            <div className="text-2xl font-bold font-mono mt-1 text-indigo-50">{tpexData?.data.length || 0}</div>
          </div>
          <div className="bg-indigo-500/10 p-2 rounded-lg"><Activity className="w-5 h-5 text-indigo-400" /></div>
        </div>
      </div>

      {/* Search Bar Integration (preserved functionality) */}
      <div className="mb-6 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
        <input
          type="text"
          placeholder="Filtering securities across terminal channels..."
          className="w-full pl-12 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 text-sm text-slate-200 transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6 flex-grow overflow-hidden">
        
        {/* Left Panel: Dispositioned Securities (7/12) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="bg-slate-800/40 px-4 py-3 flex justify-between items-center border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center text-slate-100">
              <ShieldAlert className="w-4 h-4 mr-2 text-sky-400" />
              {punishData?.name || "處置資訊"}
            </h2>
            <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 font-bold">L-48H WINDOW</span>
          </div>
          
          <div className="flex-grow overflow-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-600 font-mono text-sm">LOADING SEC_DATA...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-950/40 backdrop-blur-sm z-10">
                  <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    {punishData?.fields?.map((f, i) => (
                      <th key={i} className="px-4 py-3 font-semibold">{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {punishData && filteredData(punishData.data || []).map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-sky-500/5 transition-colors group">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className={`px-4 py-4 ${j === 1 ? 'font-mono text-sky-400 font-bold' : ''}`}>
                          {j === 4 ? (
                            <div className="max-w-[200px] truncate text-slate-400 group-hover:text-slate-300" title={val as string}>{val as string}</div>
                          ) : (val as string)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!loading && punishData && filteredData(punishData.data || []).length === 0 && (
                    <tr>
                      <td colSpan={punishData.fields?.length || 1} className="px-4 py-12 text-center text-slate-600 italic">NO ACTIVE RECORDS FOUND</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Panels (5/12) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-6 overflow-hidden">
          
          {/* Top Right: Notice Trading Info */}
          <div className="flex-1 flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-800/40 px-4 py-3 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center text-slate-100">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                {noteData?.name || "注意資訊"}
              </h2>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-grow custom-scrollbar">
              {noteData && filteredData(noteData.data).map((row, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/20 rounded border border-slate-800/50 hover:border-amber-500/40 transition-colors">
                  <div>
                    <div className="text-sky-400 font-mono text-[13px] font-bold">{row.code} {row.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-tight mt-0.5 max-w-[180px] truncate">{row.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400">{row.date}</div>
                    <div className="text-[9px] font-bold text-amber-500/80 mt-1">VOL_NOTICE</div>
                  </div>
                </div>
              ))}
              {!loading && noteData && filteredData(noteData.data).length === 0 && (
                <div className="text-center py-8 text-slate-600 text-xs italic">CLEAN CHANNEL</div>
              )}
            </div>
          </div>

          {/* Bottom Right: OTC Warning Stats */}
          <div className="flex-1 flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="bg-slate-800/40 px-4 py-3 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center text-slate-100">
                <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                {tpexData?.name || "上櫃異動"}
              </h2>
            </div>
            <div className="p-5 flex flex-col h-full overflow-hidden">
              <div className="flex-grow overflow-auto custom-scrollbar pr-1">
                <div className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-semibold">Accumulated Rankings</div>
                <div className="space-y-2">
                  {tpexData && filteredData(tpexData.data).slice(0, 10).map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-[13px] py-1.5 border-b border-slate-800/50">
                      <span className="font-mono text-slate-300">{row.code} <span className="text-slate-500 text-xs font-sans">{row.name}</span></span>
                      <span className="text-indigo-400 font-mono font-bold text-xs">{row.count} <span className="text-[10px] text-slate-600 font-normal">ACC</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="mt-6 flex justify-between items-center text-[9px] text-slate-500 font-mono tracking-tighter border-t border-slate-800 pt-3">
        <div className="flex space-x-6">
          <span className="flex items-center gap-1.5 underline decoration-slate-700 underline-offset-4">
            <Monitor className="w-3 h-3 text-slate-600" /> SOURCE: TWSE/TPEX_RAW
          </span>
          <span className="hidden sm:inline">ENDPOINT: /API/STOCK-INFO</span>
          <span className="hidden md:inline">ENCODING: UTF-8_JSON</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.twse.com.tw" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors flex items-center gap-1">官方原始公告 <ExternalLink className="w-2.5 h-2.5" /></a>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> TERMINAL_ID: AIS-SEC-00{data.length}</span>
        </div>
      </footer>
      
      {/* Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

