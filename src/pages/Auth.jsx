import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { LogIn, UserPlus, KeyRound, Mail, CheckSquare } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isDark = document.documentElement.classList.contains("dark");
    const toastStyles = {
      style: {
        background: isDark ? "#1F2937" : "#FFFFFF",
        color: isDark ? "#FFFFFF" : "#111827",
      },
    };

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message, toastStyles);
      } else {
        toast.success(
          "Instance initialized. Check your email for validation link!",
          {
            ...toastStyles,
            duration: 6000,
          },
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) toast.error(error.message, toastStyles);
      else toast.success("Access authorized.", toastStyles);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md space-y-6 relative group">
        {/* --- SYSTEM LOGO INTEGRATION HEADER --- */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 select-none">
            {/* LeetCode Node */}
            <div className="flex items-center justify-center w-8 h-8 bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-700 p-1.5 shadow-xs">
              <img
                src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/leetcode.svg"
                alt="LeetCode"
                className="w-full h-full object-contain"
                style={{
                  filter:
                    "invert(73%) sepia(50%) saturate(1982%) hue-rotate(360deg) brightness(101%) contrast(105%)",
                }}
              />
            </div>
            {/* GeeksForGeeks Node */}
            <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-xs">
              <img
                src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/geeksforgeeks.svg"
                alt="GFG"
                className="w-full h-full object-contain"
                style={{
                  filter:
                    "invert(41%) sepia(52%) saturate(575%) hue-rotate(85deg) brightness(93%) contrast(85%)",
                }}
              />
            </div>
            {/* Scaler Node */}
            <div className="flex items-center justify-center w-8 h-8 bg-[#0D0E12] rounded-lg border border-gray-200 dark:border-gray-700 p-1.5 shadow-xs">
              <img
                src="https://assets-v2.scaler.com/packs/images/logo.edc556.svg"
                alt="Scaler"
                className="w-full h-full object-contain brightness-120"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <CheckSquare
                size={22}
                className="text-blue-600 dark:text-blue-400 shrink-0"
              />
              <span>DSA Revision Tracker</span>
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">
              {isSignUp
                ? "Create an account to start tracking your daily progress."
                : "Log in to view and manage your active revision queues."}
            </p>
          </div>
        </div>

        {/* --- BRAND COMPLIANT CONTROL FORM --- */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full pl-9 pr-4 p-2 text-sm border rounded-lg bg-white dark:bg-gray-700/40 border-gray-300 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-4 p-2 text-sm border rounded-lg bg-white dark:bg-gray-700/40 border-gray-300 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-[0.99] mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus size={16} /> Register Instance
              </>
            ) : (
              <>
                <LogIn size={16} /> Authenticate Session
              </>
            )}
          </button>
        </form>

        {/* --- SYSTEM LINK CONTROLLER FOOTER --- */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold font-mono tracking-tight transition-colors"
          >
            {isSignUp
              ? "[ return to active login ]"
              : "[ initialize new coder instance ]"}
          </button>
        </div>
      </div>
    </div>
  );
}
