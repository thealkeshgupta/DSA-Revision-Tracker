import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, Sun, Moon, LogOut, Menu, X } from "lucide-react";

export default function Navbar({
  darkMode,
  setDarkMode,
  logout,
  getLinkClass,
}) {
  // Mobile drawer visibility toggle state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-4">
          {/* Logo Section */}
          {/* FIX 1: Hardened shrink-0 prevents title clipping under any screen compression */}
          <div className="flex items-center gap-2 shrink-0">
            <Terminal className="text-blue-600 dark:text-blue-400" size={24} />
            <h1 className="text-xl font-bold font-mono text-gray-800 dark:text-white whitespace-nowrap">
              DSA Revision Tracker
            </h1>
          </div>

          {/* --- DESKTOP VIEWPORTS --- */}
          {/* FIX 2: Added flex-1 min-w-0 and scaled down the base gap-2 to dynamically 
              give up space on smaller screens before the sidebar drawer triggers */}
          <div className="hidden lg:flex flex-nowrap items-center justify-end flex-1 min-w-0 gap-2 xl:gap-6">
            <Link to="/" className={`${getLinkClass("/")} shrink-0`}>
              Dashboard
            </Link>
            <Link
              to="/master"
              className={`${getLinkClass("/master")} shrink-0`}
            >
              Add Problem
            </Link>
            <Link
              to="/all-problems"
              className={`${getLinkClass("/all-problems")} shrink-0`}
            >
              All Problems
            </Link>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 shrink-0"></div>

            <Link
              to="/next-day"
              className={`${getLinkClass("/next-day")} shrink-0`}
            >
              Next Day
            </Link>
            <Link
              to="/weekend"
              className={`${getLinkClass("/weekend")} shrink-0`}
            >
              Weekend
            </Link>
            <Link
              to="/monthly"
              className={`${getLinkClass("/monthly")} shrink-0`}
            >
              Monthly
            </Link>
            <Link to="/adhoc" className={`${getLinkClass("/adhoc")} shrink-0`}>
              Ad-Hoc
            </Link>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-2 border border-gray-200 dark:border-gray-600 shrink-0"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-gray-900/40 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700/60 rounded-xl transition-all duration-150 group shrink-0"
            >
              <LogOut
                size={16}
                className="text-gray-400 group-hover:text-red-500 transition-colors"
              />
            </button>
          </div>

          {/* --- MOBILE HAMBURGER TOGGLE --- */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50 relative"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- ANIMATED MOBILE SIDE MENU DRAWER OVERLAY --- */}
      {/* Backdrop Fade Layer */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Side Drawer Body Container */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 p-6 pt-24 flex flex-col justify-between z-40 lg:hidden transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Navigation Routes Vertical Stack */}
        <div className="flex flex-col gap-1">
          {/* Section Subtitle */}
          <span className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase px-3 mb-2 select-none">
            Navigation
          </span>

          <Link
            to="/"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${getLinkClass("/")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/master"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${getLinkClass("/master")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Add Problem
          </Link>

          <Link
            to="/all-problems"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${getLinkClass("/all-problems")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            All Problems
          </Link>

          {/* Subtle Divider Line */}
          <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-3 px-3"></div>

          {/* Section Subtitle */}
          <span className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase px-3 mb-2 select-none">
            Revision Queues
          </span>

          <Link
            to="/next-day"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${getLinkClass("/next-day")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Next Day
          </Link>

          <Link
            to="/weekend"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${getLinkClass("/weekend")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Weekend
          </Link>

          <Link
            to="/monthly"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${getLinkClass("/monthly")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Monthly
          </Link>

          <Link
            to="/adhoc"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${getLinkClass("/adhoc")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Ad-Hoc
          </Link>
        </div>

        {/* Bottom Panel Session LogOut Handle */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-gray-800/40 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-all shadow-xs group"
          >
            <LogOut
              size={18}
              className="text-gray-400 group-hover:text-red-500 transition-colors"
            />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </>
  );
}
