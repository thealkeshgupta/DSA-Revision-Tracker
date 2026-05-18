import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun, Terminal } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import MasterLog from "./pages/MasterLog";
import RevisionQueue from "./pages/RevisionQueue";
import AllProblems from "./pages/AllProblems";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import LoadingScreen from "./components/LoadingScreen";
import Auth from "./pages/Auth";
import { LogOut } from "lucide-react";
import Navbar from "./components/Navbar";

function App() {
  const { user, authLoading, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation(); // Used to highlight the active link

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Helper function to style active links
  const getLinkClass = (path) => {
    const baseClass = "transition-colors font-medium text-sm lg:text-base ";
    const activeClass =
      "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1";
    const inactiveClass =
      "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 pb-1";
    return (
      baseClass + (location.pathname === path ? activeClass : inactiveClass)
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingScreen message="Validating authorization session signatures..." />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" reverseOrder={false} />
        <Auth />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <Toaster position="bottom-center" reverseOrder={false} />
      {/* Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        getLinkClass={getLinkClass}
        logout={logout}
      />
      {/* Main Page Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 mt-2">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/master" element={<MasterLog />} />

          <Route path="/all-problems" element={<AllProblems />} />

          {/* We reuse the RevisionQueue component but pass different props for each page! */}
          <Route
            path="/next-day"
            element={
              <RevisionQueue
                title="Next Day Revisions"
                stageFilter="NEXT_DAY"
              />
            }
          />
          <Route
            path="/weekend"
            element={
              <RevisionQueue title="Weekend Revisions" stageFilter="WEEKEND" />
            }
          />
          <Route
            path="/monthly"
            element={
              <RevisionQueue title="Monthly Revisions" stageFilter="MONTHLY" />
            }
          />
          <Route
            path="/adhoc"
            element={
              <RevisionQueue
                title="Ad-Hoc / Mastered List"
                stageFilter="AD_HOC"
              />
            }
          />
        </Routes>
      </main>
      <footer className="w-full mt-auto py-4 border-t border-gray-200/50 dark:border-gray-800/60 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left branding */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 font-mono tracking-tight select-none">
            <Terminal className="text-blue-300 dark:text-blue-200" size={18} />
            <span>DSA Revision Tracker</span>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded border border-gray-200/40 dark:border-gray-700/30 font-sans font-medium">
              v1.0.0
            </span>
          </div>

          {/* Right author link */}
          <div className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <span>Engineered by</span>
            <a
              href="https://github.com/thealkeshgupta"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover:underline inline-flex items-center gap-1"
            >
              <span>Alkesh Gupta</span>
              <svg
                className="w-3 h-3 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
