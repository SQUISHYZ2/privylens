import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Eye, ExternalLink, Phone, FileText, ChevronRight, RotateCcw } from "lucide-react";

const VERDICT_CONFIG = {
  AUTHENTIC: { icon: ShieldCheck, color: "text-emerald-accent", bg: "bg-emerald-accent/10", border: "border-emerald-accent/20", label: "Authentic" },
  SUSPICIOUS: { icon: ShieldAlert, color: "text-amber-accent", bg: "bg-amber-accent/10", border: "border-amber-accent/20", label: "Suspicious" },
  LIKELY_MANIPULATED: { icon: ShieldX, color: "text-rose-accent", bg: "bg-rose-accent/10", border: "border-rose-accent/20", label: "Likely Manipulated" },
  CONFIRMED_DEEPFAKE: { icon: ShieldX, color: "text-danger", bg: "bg-danger/10", border: "border-danger/20", label: "Confirmed Deepfake" },
};

const SEVERITY_COLORS = { low: "text-emerald-accent", medium: "text-amber-accent", high: "text-rose-accent", critical: "text-danger" };

const REPORT_LINKS = [
  { name: "Instagram", url: "https://help.instagram.com/contact/504521742987441" },
  { name: "X (Twitter)", url: "https://help.twitter.com/en/forms/safety-and-sensitive-content" },
  { name: "Facebook", url: "https://www.facebook.com/help/contact/567360146613371" },
  { name: "YouTube", url: "https://support.google.com/youtube/answer/2802027" },
  { name: "Telegram", url: "https://telegram.org/faq#q-how-do-i-report-them" },
];

const HELPLINES = [
  { name: "National Cyber Crime (IN)", number: "1930", url: "https://cybercrime.gov.in" },
  { name: "Women Helpline (IN)", number: "181", url: "tel:181" },
  { name: "NCMEC CyberTipline (US)", number: "", url: "https://www.missingkids.org/gethelpnow/cybertipline" },
  { name: "Internet Watch Foundation (UK)", number: "", url: "https://www.iwf.org.uk" },
];

export default function ResultDashboard({ result, preview, onReset }) {
  if (!result) return null;
  const { authenticity, leakScout } = result;
  const vc = VERDICT_CONFIG[authenticity.verdict] || VERDICT_CONFIG.SUSPICIOUS;
  const VIcon = vc.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Analysis Complete</h2>
        <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-sm text-text-secondary transition-colors"><RotateCcw className="w-4 h-4" />New Scan</button>
      </div>

      {/* Top cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Verdict Card */}
        <div className={`rounded-2xl p-6 glass-elevated border ${vc.border}`}>
          <div className={`w-12 h-12 rounded-xl ${vc.bg} flex items-center justify-center mb-4`}><VIcon className={`w-6 h-6 ${vc.color}`} /></div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Verdict</p>
          <p className={`text-xl font-bold ${vc.color}`}>{vc.label}</p>
          <p className="text-xs text-text-dim mt-1">Confidence: {authenticity.confidence}%</p>
        </div>

        {/* Authenticity Gauge */}
        <div className="rounded-2xl p-6 glass-elevated flex flex-col items-center">
          <GaugeCircle value={authenticity.authenticity_score} label="Authenticity" color={authenticity.authenticity_score > 70 ? "#10b981" : authenticity.authenticity_score > 40 ? "#f59e0b" : "#ef4444"} />
        </div>

        {/* Leak Risk Gauge */}
        <div className="rounded-2xl p-6 glass-elevated flex flex-col items-center">
          <GaugeCircle value={leakScout.leak_risk_score} label="Leak Risk" color={leakScout.leak_risk_score < 30 ? "#10b981" : leakScout.leak_risk_score < 60 ? "#f59e0b" : "#ef4444"} invert />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings */}
        <div className="rounded-2xl p-6 glass-elevated">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-accent" />Forensic Findings</h3>
          <div className="space-y-3">
            {authenticity.findings?.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface">
                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${f.severity === "critical" ? "bg-danger" : f.severity === "high" ? "bg-rose-accent" : f.severity === "medium" ? "bg-amber-accent" : "bg-emerald-accent"}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-text-dim uppercase">{f.category}</span><span className={`text-xs font-medium ${SEVERITY_COLORS[f.severity]}`}>{f.severity}</span></div>
                  <p className="text-sm text-text-secondary">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-text-secondary italic">{authenticity.summary}</p>
        </div>

        {/* Leak Scout */}
        <div className="rounded-2xl p-6 glass-elevated">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-accent" />Privacy Exposure</h3>
          <div className="mb-4 px-3 py-2 rounded-lg bg-surface inline-flex items-center gap-2"><span className="text-xs text-text-dim">Exposure Level:</span><span className={`text-xs font-bold ${leakScout.privacy_exposure === "CRITICAL" || leakScout.privacy_exposure === "HIGH" ? "text-danger" : leakScout.privacy_exposure === "MODERATE" ? "text-amber-accent" : "text-emerald-accent"}`}>{leakScout.privacy_exposure}</span></div>
          <div className="space-y-3">
            {leakScout.identifiable_features?.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface">
                <p className="text-sm text-text-primary mb-1">{f.feature}</p>
                <div className="flex items-center gap-3 text-xs text-text-dim"><span>Search: <span className={SEVERITY_COLORS[f.risk_level]}>{f.searchability}</span></span><span>Risk: <span className={SEVERITY_COLORS[f.risk_level]}>{f.risk_level}</span></span></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-text-secondary italic">{leakScout.summary}</p>
        </div>
      </div>

      {/* Legal Toolbox */}
      <div className="rounded-2xl p-6 glass-elevated">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-accent" />Legal Toolbox & Action Center</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Report to Platforms</p>
            <div className="space-y-2">
              {REPORT_LINKS.map((r) => (
                <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors group">
                  <span className="text-sm text-text-secondary group-hover:text-text-primary">{r.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-dim group-hover:text-accent" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Emergency Helplines</p>
            <div className="space-y-2">
              {HELPLINES.map((h) => (
                <a key={h.name} href={h.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors group">
                  <div><p className="text-sm text-text-secondary group-hover:text-text-primary">{h.name}</p>{h.number && <p className="text-xs text-accent font-mono">{h.number}</p>}</div>
                  <Phone className="w-3.5 h-3.5 text-text-dim group-hover:text-emerald-accent" />
                </a>
              ))}
            </div>
          </div>
        </div>
        {/* Recommendations */}
        {authenticity.recommendations?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Recommendations</p>
            <div className="space-y-2">{authenticity.recommendations.map((r, i) => (<div key={i} className="flex items-start gap-2 text-sm text-text-secondary"><ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />{r}</div>))}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function GaugeCircle({ value, label, color, invert }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (value / 100) * circumference;
  return (
    <>
      <svg width="100" height="100" viewBox="0 0 100 100" className="mb-3">
        <circle className="gauge-track" cx="50" cy="50" r="45" />
        <circle className="gauge-fill" cx="50" cy="50" r="45" stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} style={{ animation: "gauge-fill 1.2s ease-out 0.3s both", ["--gauge-offset"]: offset }} />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="fill-text-primary text-2xl font-bold" style={{ fontSize: "24px" }}>{value}</text>
      </svg>
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-xs text-text-dim mt-0.5">{invert ? (value < 30 ? "Low Risk" : value < 60 ? "Moderate" : "High Risk") : (value > 70 ? "Likely Real" : value > 40 ? "Uncertain" : "Likely Fake")}</p>
    </>
  );
}
