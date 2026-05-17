import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { calculateNextRevision, getLocalYMD } from "../lib/revisionLogic";
import { CheckCircle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";

const PlatformLogo = ({ platform }) => {
  switch (platform) {
    case "LeetCode":
      return (
        <div
          title="LeetCode"
          className="flex items-center justify-center w-8 h-8 bg-[#1A1A1A] rounded-lg shadow-sm shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden p-1.5"
        >
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
      );
    case "GFG":
      return (
        <div
          title="GeeksForGeeks"
          className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden p-1"
        >
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
      );
    case "Scaler":
      return (
        <div
          title="Scaler"
          className="flex items-center justify-center w-8 h-8 bg-[#0D0E12] rounded-lg shadow-sm shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden p-1.5"
        >
          <img
            src="https://assets-v2.scaler.com/packs/images/logo.edc556.svg"
            alt="Scaler"
            className="w-full h-full object-contain brightness-120"
          />
        </div>
      );
    default:
      return (
        <div
          title="Other Platform"
          className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg shadow-sm shrink-0 border border-gray-300 dark:border-gray-600 p-2"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        </div>
      );
  }
};

const DifficultyChip = ({ label, type }) => {
  if (!label) return null;
  const colors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Difficult: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Simple:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Good: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "Required PreReading":
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[label] || "bg-gray-100 text-gray-800"}`}
    >
      {type === "site" ? "Site: " : "Felt: "}
      {label}
    </span>
  );
};

export default function RevisionQueue({ title, stageFilter }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW STATES: REVISION INTERFACE ACTIVE FILTER POOLS ---
  const [siteDifficultyFilter, setSiteDifficultyFilter] = useState("All");
  const [personalDifficultyFilter, setPersonalDifficultyFilter] =
    useState("All");
  const [queueSearchTerm, setQueueSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchProblems = async () => {
    setLoading(true);
    const now = new Date();
    let visibilityTargetDate = new Date();

    if (stageFilter === "WEEKEND") {
      const currentDayOfWeek = now.getDay();
      if (currentDayOfWeek === 6) {
        visibilityTargetDate.setDate(now.getDate() + 1);
      }
    } else if (stageFilter === "MONTHLY") {
      const totalDaysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const daysRemainingInMonth = totalDaysInMonth - now.getDate();
      if (daysRemainingInMonth <= 7) {
        visibilityTargetDate.setDate(now.getDate() + daysRemainingInMonth);
      }
    }

    const targetDateStr = visibilityTargetDate.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    let query = supabase
      .from("problems")
      .select("*")
      .eq("revision_stage", stageFilter);

    if (stageFilter !== "AD_HOC") {
      query = query
        .lte("next_revision_due", targetDateStr)
        .order("next_revision_due", { ascending: true });
    } else {
      query = query.order("last_revised", { ascending: false });
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching problems:", error);
    else setProblems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProblems();
  }, [stageFilter]);

  // Adjust page index tracking dynamically when criteria parameters alter structure shapes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    pageSize,
    siteDifficultyFilter,
    personalDifficultyFilter,
    queueSearchTerm,
  ]);

  const handleComplete = async (problem) => {
    const todayStr = getLocalYMD();
    const { nextStage, nextDate } = calculateNextRevision(
      problem.revision_stage,
    );
    const updatedHistory = [...(problem.revision_history || []), todayStr];

    const { error } = await supabase
      .from("problems")
      .update({
        revision_stage: nextStage,
        next_revision_due: nextDate,
        last_revised: todayStr,
        revision_history: updatedHistory,
      })
      .eq("id", problem.id);

    if (error) alert("Failed to update: " + error.message);
    else setProblems(problems.filter((p) => p.id !== problem.id));
  };

  if (loading)
    return <LoadingScreen message={`Compiling ${title} matrix...`} />;

  // --- FILTER TRANSFORMATION COMPUTE PIPELINE ---
  const filteredProblems = problems.filter((p) => {
    const searchLower = queueSearchTerm.toLowerCase();
    const matchesName = p.problem_name.toLowerCase().includes(searchLower);
    const matchesConcept = p.concepts?.some((c) =>
      c.toLowerCase().includes(searchLower),
    );
    const matchesText = matchesName || matchesConcept;

    const matchesSiteDiff =
      siteDifficultyFilter === "All" ||
      p.site_difficulty === siteDifficultyFilter;
    const matchesPersDiff =
      personalDifficultyFilter === "All" ||
      p.personal_difficulty === personalDifficultyFilter;

    return matchesText && matchesSiteDiff && matchesPersDiff;
  });

  const totalItems = filteredProblems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProblems = filteredProblems.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>
      </div>

      {/* --- REUSABLE ADAPTIVE FILTER CONTROL BAR --- */}
      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        {/* Search Field Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search this queue..."
            className="w-full pl-8 p-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={queueSearchTerm}
            onChange={(e) => setQueueSearchTerm(e.target.value)}
          />
        </div>

        {/* Site Difficulty dropdown parameter selection node */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
            Site:
          </span>
          <select
            className="w-full p-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={siteDifficultyFilter}
            onChange={(e) => setSiteDifficultyFilter(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Personal Friction dropdown parameter selection node */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
            Felt:
          </span>
          <select
            className="w-full p-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={personalDifficultyFilter}
            onChange={(e) => setPersonalDifficultyFilter(e.target.value)}
          >
            <option value="All">All Friction Levels</option>
            <option value="Simple">Simple</option>
            <option value="Good">Good</option>
            <option value="Difficult">Difficult</option>
            <option value="Required PreReading">Required Pre-Reading</option>
          </select>
        </div>

        {/* Queue Display Page Sizing configuration drop options */}
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
            Show:
          </span>
          <select
            className="w-20 p-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {filteredProblems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium font-mono">
            No matching records found inside this operational branch queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="grid gap-4">
            {paginatedProblems.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <PlatformLogo platform={p.platform} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg dark:text-white mb-1">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {p.problem_name}
                      </a>
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <DifficultyChip label={p.site_difficulty} type="site" />
                      <DifficultyChip
                        label={p.personal_difficulty}
                        type="personal"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      <span className="font-semibold">Concepts:</span>{" "}
                      {p.concepts?.join(", ") || "None"}
                      <span className="mx-2">•</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        Last Revised: {p.last_revised}
                      </span>
                    </p>
                  </div>
                </div>

                {stageFilter !== "AD_HOC" && (
                  <button
                    onClick={() => handleComplete(p)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shrink-0 shadow-sm font-semibold text-sm"
                  >
                    <CheckCircle size={18} /> Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {Math.min(endIndex, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {totalItems}
                </span>{" "}
                items
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="p-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white disabled:opacity-30 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 text-xs rounded-md font-semibold transition ${currentPage === pageNum ? "bg-blue-600 text-white shadow" : "border text-gray-600 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="p-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white disabled:opacity-30 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
