import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * Main layout wrapper with navbar and content area.
 */
export default function Layout({ user }) {
  return (
    <div className="min-h-screen bg-void text-text-primary">
      <Navbar user={user} />

      {/* Content area with nav offset */}
      <main className="pt-16 min-h-screen">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-dim">
          <p>
            © {new Date().getFullYear()} PrivyLens — Privacy-First AI Detection.
            Built for Google Solution Challenge.
          </p>
          <div className="flex items-center gap-4">
            <span>SDG 16: Peace, Justice & Strong Institutions</span>
            <span className="w-1 h-1 rounded-full bg-text-dim" />
            <span>Zero Data Retention</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
