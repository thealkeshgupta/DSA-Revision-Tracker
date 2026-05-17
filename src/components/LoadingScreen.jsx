import { Loader2 } from "lucide-react";

export default function LoadingScreen({
  message = "Syncing with Database Ledger...",
}) {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-6 space-y-6">
      {/* Premium Multi-Layer Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-blue-500/10 dark:border-blue-400/5 animate-pulse" />

        {/* Middle track ring */}
        <div className="absolute w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-800" />

        {/* Inner high-speed spinning accent */}
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin stroke-[1.5]" />
      </div>

      {/* Subtle Terminal-Style Tracking Typography */}
      <div className="flex flex-col items-center space-y-1 text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide font-mono animate-pulse">
          {message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          Optimizing revision indices
        </p>
      </div>
    </div>
  );
}
