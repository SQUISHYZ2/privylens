import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";
import Scanner from "../components/Scanner";
import ResultDashboard from "../components/ResultDashboard";
import { useScanLifecycle } from "../hooks/useScanLifecycle";

export default function Scan() {
  const scanState = useScanLifecycle();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          {scanState.hasResult ? "Scan Results" : "Privacy Scan"}
        </h1>
        <p className="text-text-secondary max-w-md mx-auto">
          {scanState.hasResult
            ? "Review the AI analysis of your uploaded media."
            : "Upload an image to detect deepfakes and assess leak risk."}
        </p>
        {!scanState.hasResult && (
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-text-dim">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-accent" />Encrypted</span>
            <span className="w-1 h-1 rounded-full bg-text-dim" />
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-accent" />Auto-delete 24h</span>
          </div>
        )}
      </motion.div>

      {/* Scanner or Results */}
      {scanState.hasResult ? (
        <ResultDashboard
          result={scanState.result}
          preview={scanState.preview}
          onReset={scanState.reset}
        />
      ) : (
        <Scanner
          scanState={scanState}
          onStartScan={scanState.startScan}
          onReset={scanState.reset}
        />
      )}
    </div>
  );
}
