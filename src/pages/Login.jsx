import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, ChevronRight, Zap, Clock, Scale } from "lucide-react";
import {
  signInWithGoogle,
  getAuthErrorMessage,
  getFirebaseConfigStatus,
} from "../config/firebase";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isConfigured, missingKeys } = getFirebaseConfigStatus();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const features = [
    { icon: Eye, title: "AI Deepfake Detection", desc: "Gemini-powered forensic analysis" },
    { icon: Zap, title: "Instant Leak Scouting", desc: "Identify exposure risks in seconds" },
    { icon: Clock, title: "24h Auto-Delete", desc: "Zero retention — your data disappears" },
    { icon: Scale, title: "Legal Toolkit", desc: "Report templates for major platforms" },
  ];

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-accent/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left: Branding */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <Shield className="w-12 h-12 text-accent" strokeWidth={1.5} />
              <Eye className="absolute w-5 h-5 text-cyan-accent mt-0.5" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Privy<span className="text-accent">Lens</span></h1>
          </div>
          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto lg:mx-0">Protect your digital identity with AI-powered deepfake detection and privacy leak analysis.</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="p-3 rounded-xl bg-surface-elevated/50 border border-border-subtle">
                <f.icon className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-medium text-text-primary">{f.title}</p>
                <p className="text-xs text-text-dim mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Login Card */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="rounded-2xl glass-elevated p-8 max-w-sm mx-auto">
            {/* Privacy Guarantee Banner */}
            <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-1">Privacy Guarantee</p>
                  <p className="text-xs text-text-secondary leading-relaxed">Your uploads are encrypted, analyzed on-demand, and permanently deleted within 24 hours. We never store, share, or train on your data.</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-1">Welcome</h2>
            <p className="text-sm text-text-secondary mb-6">Sign in to start protecting your digital privacy.</p>

            <button onClick={handleLogin} disabled={loading || !isConfigured} className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-dim hover:border-accent/30 text-text-primary font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {loading ? "Signing in..." : !isConfigured ? "Configure Firebase to Continue" : "Continue with Google"}
              {!loading && <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-accent transition-colors" />}
            </button>

            {!isConfigured && (
              <p className="mt-4 text-xs text-amber-400 text-center">
                Firebase setup required. Missing: {missingKeys.join(", ")}
              </p>
            )}

            {error && <p className="mt-4 text-sm text-danger text-center">{error}</p>}

            <p className="mt-6 text-center text-xs text-text-dim">SDG 16 — Peace, Justice & Strong Institutions</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
