import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Shield, ShieldAlert, ShieldCheck, ShieldX, Trash2, Loader2 } from "lucide-react";
import { getUserScans, deleteScanResult } from "../config/firebase";

const VERDICT_ICON = { AUTHENTIC: ShieldCheck, SUSPICIOUS: ShieldAlert, LIKELY_MANIPULATED: ShieldX, CONFIRMED_DEEPFAKE: ShieldX };
const VERDICT_COLOR = { AUTHENTIC: "text-emerald-accent", SUSPICIOUS: "text-amber-accent", LIKELY_MANIPULATED: "text-rose-accent", CONFIRMED_DEEPFAKE: "text-danger" };

export default function History({ user }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserScans(user.uid).then(setScans).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await deleteScanResult(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Scan History</h1>
        <p className="text-text-secondary text-sm mb-6">Results auto-expire after 24 hours.</p>
      </motion.div>

      {scans.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 rounded-2xl glass-elevated">
          <Clock className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No scans yet</h3>
          <p className="text-sm text-text-secondary">Your scan history will appear here. All results auto-delete after 24 hours.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan, i) => {
            const verdict = scan.authenticity?.verdict || "SUSPICIOUS";
            const VIcon = VERDICT_ICON[verdict] || ShieldAlert;
            const color = VERDICT_COLOR[verdict] || "text-amber-accent";
            const expiresAt = scan.expiresAt?.toDate?.() || new Date();
            const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 3600000));

            return (
              <motion.div key={scan.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-4 rounded-xl glass-elevated group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${verdict === "AUTHENTIC" ? "bg-emerald-accent/10" : verdict === "SUSPICIOUS" ? "bg-amber-accent/10" : "bg-danger/10"} flex items-center justify-center`}>
                    <VIcon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{scan.fileName || "Scan"}</p>
                    <div className="flex items-center gap-3 text-xs text-text-dim">
                      <span className={color}>{verdict.replace(/_/g, " ")}</span>
                      <span>Score: {scan.authenticity?.authenticity_score || "—"}%</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{remaining}h left</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(scan.id)} className="p-2 rounded-lg text-text-dim hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
