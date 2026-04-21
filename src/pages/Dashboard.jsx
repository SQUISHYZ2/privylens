import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Eye, ScanLine, Clock, Scale, ArrowRight, Activity, ShieldCheck } from "lucide-react";

export default function Dashboard({ user }) {
  const stats = [
    { label: "Scans Today", value: "—", icon: ScanLine, color: "text-accent" },
    { label: "Threats Found", value: "—", icon: Activity, color: "text-amber-accent" },
    { label: "Vault Status", value: "Active", icon: Shield, color: "text-emerald-accent" },
    { label: "Auto-Delete", value: "24h TTL", icon: Clock, color: "text-cyan-accent" },
  ];

  const quickActions = [
    { to: "/scan", label: "Start New Scan", desc: "Upload an image for AI analysis", icon: Eye, primary: true },
    { to: "/history", label: "View History", desc: "Check recent scan results", icon: Clock, primary: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
          Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-text-secondary">Your digital privacy dashboard.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl p-5 glass-elevated">
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {quickActions.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <Link to={a.to} className={`group flex items-center justify-between p-6 rounded-2xl transition-all ${a.primary ? "bg-accent/10 border border-accent/20 hover:bg-accent/15 hover:border-accent/30" : "glass-elevated hover:bg-surface-hover"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.primary ? "bg-accent/20" : "bg-surface"}`}>
                  <a.icon className={`w-6 h-6 ${a.primary ? "text-accent" : "text-text-muted"}`} />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{a.label}</p>
                  <p className="text-sm text-text-secondary">{a.desc}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-text-dim group-hover:text-accent transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Platform Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-6 glass-elevated">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-accent" />How PrivyLens Protects You</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Eye, title: "Dual-Model AI Analysis", desc: "Gemini 1.5 Pro runs parallel deepfake detection and leak scouting for comprehensive protection." },
            { icon: Clock, title: "Ephemeral Storage", desc: "All data is tagged with a 24-hour TTL. Firebase automatically purges expired records." },
            { icon: Scale, title: "Legal Action Center", desc: "Pre-filled report templates for Instagram, X, Facebook, and direct helpline access." },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface">
              <f.icon className="w-5 h-5 text-accent mb-3" />
              <p className="text-sm font-medium text-text-primary mb-1">{f.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
