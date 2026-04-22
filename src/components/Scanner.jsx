import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Shield, Eye, Loader2, FileImage, AlertTriangle, RefreshCw } from "lucide-react";
import { SCAN_STATES } from "../hooks/useScanLifecycle";

const ACCEPTED = { "image/jpeg": [".jpg",".jpeg"], "image/png": [".png"], "image/webp": [".webp"], "image/gif": [".gif"] };

export default function Scanner({ scanState, onStartScan, onReset }) {
  const { state, progress, preview, error, file } = scanState;
  const onDrop = useCallback((f) => f.length && onStartScan(f[0]), [onStartScan]);
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({ onDrop, accept: ACCEPTED, maxSize: 20*1024*1024, multiple: false, disabled: state !== SCAN_STATES.IDLE });

  if (state === SCAN_STATES.ERROR) {
    return (
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="w-full max-w-2xl mx-auto rounded-2xl p-8 glass-elevated text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-danger/10 flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-danger" /></div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Analysis Failed</h3>
        <p className="text-sm text-text-secondary mb-6">{error || "Something went wrong."}</p>
        <button onClick={onReset} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"><RefreshCw className="w-4 h-4" />Try Again</button>
      </motion.div>
    );
  }

  if (state === SCAN_STATES.UPLOADING || state === SCAN_STATES.ANALYZING) {
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden glass-elevated">
        <div className="relative aspect-video bg-surface flex items-center justify-center overflow-hidden">
          {preview ? (<><img src={preview} alt="Scanning" className="w-full h-full object-contain" />{state === SCAN_STATES.ANALYZING && <div className="scan-overlay" />}<div className="absolute inset-0 bg-void/40" /></>) : <FileImage className="w-16 h-16 text-text-dim" />}
          <div className="absolute top-4 left-4"><div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium"><Loader2 className="w-3.5 h-3.5 text-accent animate-spin" /><span className="text-text-primary">{state === SCAN_STATES.UPLOADING ? "Securing upload..." : "AI analysis in progress..."}</span></div></div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Eye className="w-4 h-4 text-accent" /><span className="text-sm font-medium">{state === SCAN_STATES.UPLOADING ? "Uploading..." : "Dual-model analysis..."}</span></div><span className="text-sm font-mono text-accent">{Math.round(progress)}%</span></div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden"><motion.div className="h-full rounded-full bg-linear-to-r from-accent to-cyan-accent" animate={{ width: `${progress}%` }} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Phase label="Deepfake Detection" active={progress > 40} done={progress > 70} />
            <Phase label="Leak Scouting" active={progress > 60} done={progress > 85} />
          </div>
          {file && <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-2 text-xs text-text-dim"><FileImage className="w-3.5 h-3.5" /><span className="truncate">{file.name}</span><span>({(file.size/1024/1024).toFixed(2)} MB)</span></div>}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="w-full max-w-2xl mx-auto">
      <div {...getRootProps()} className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${isDragActive ? "drop-active border-accent" : "border-border-dim hover:border-accent/50 hover:bg-surface-elevated/50"}`}>
        <input {...getInputProps()} id="file-upload" />
        <div className="flex justify-center mb-6"><div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? "bg-accent/20 scale-110" : "bg-surface-elevated group-hover:bg-accent/10"}`}><Upload className={`w-8 h-8 ${isDragActive ? "text-accent" : "text-text-muted group-hover:text-accent"}`} /></div></div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{isDragActive ? "Drop to analyze" : "Upload media for analysis"}</h3>
        <p className="text-sm text-text-secondary mb-4">Drag & drop an image here, or click to browse</p>
        <div className="flex items-center justify-center gap-2 text-xs text-text-dim"><FileImage className="w-3.5 h-3.5" /><span>JPG, PNG, WebP, GIF — Max 20MB</span></div>
        <div className="mt-6 pt-4 border-t border-border-subtle"><div className="flex items-center justify-center gap-2 text-xs text-text-muted"><Shield className="w-3.5 h-3.5 text-emerald-accent" /><span>Auto-deleted within 24 hours</span></div></div>
      </div>
      {fileRejections.length > 0 && <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-rose-accent flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{fileRejections[0].errors[0]?.message}</div>}
    </motion.div>
  );
}

function Phase({ label, active, done }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${done ? "bg-emerald-accent/10 text-emerald-accent" : active ? "bg-accent/10 text-accent" : "bg-surface text-text-dim"}`}>
      {done ? <div className="w-4 h-4 rounded-full bg-emerald-accent/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-accent" /></div> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
      <span className="font-medium">{label}</span>
    </div>
  );
}
