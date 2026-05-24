import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Search,
  ExternalLink,
  FileText,
  AlertTriangle,
  Trash2,
  Download,
  X,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Filter,
} from "lucide-react";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-hot-toast";

// --- HELPER COMPONENTS ---
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
          className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg shadow-sm shrink-0 border border-gray-300 dark:border-gray-600 p-2"
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
      className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[label] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}
    >
      {type === "site" ? "Site: " : "Felt: "}
      {label}
    </span>
  );
};

const StageBadge = ({ stage }) => {
  const stages = {
    NEXT_DAY: {
      label: "Next Day Queue",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    WEEKEND: {
      label: "Weekend Queue",
      color:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
    MONTHLY: {
      label: "Monthly Queue",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    },
    AD_HOC: {
      label: "Mastered (Ad-Hoc)",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
  };
  const config = stages[stage] || {
    label: stage,
    color: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-bold rounded border ${config.color} border-current opacity-80`}
    >
      {config.label}
    </span>
  );
};

// --- MAIN COMPONENT ---
export default function AllProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [conceptOptions, setConceptOptions] = useState([]);
  const [isDark, setIsDark] = useState(false);

  // --- FILTER TRACKERS ---
  const [siteDifficultyFilter, setSiteDifficultyFilter] = useState("All");
  const [personalDifficultyFilter, setPersonalDifficultyFilter] =
    useState("All");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // --- SORTING TRACKERS ---
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // --- MOBILE UI TRACKER ---
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // --- PAGINATION TRACKERS ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- MODAL TRACKERS ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    text: "",
    type: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    personal_difficulty: "Good",
    approach: "",
    mistakes: "",
  });
  const [editSelectedConcepts, setEditSelectedConcepts] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);

  useEffect(() => {
    const checkTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const selectDarkStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#374151" : "#FFFFFF",
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
      color: isDark ? "#FFFFFF" : "#111827",
      boxShadow: state.isFocused ? "0 0 0 2px #3B82F6" : "none",
      "&:hover": { borderColor: isDark ? "#4B5563" : "#9CA3AF" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#374151" : "#FFFFFF",
      color: isDark ? "#FFFFFF" : "#111827",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDark
          ? "#4B5563"
          : "#F3F4F6"
        : "transparent",
      color: isDark ? "#FFFFFF" : "#111827",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1F2937" : "#E5E7EB",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#F3F4F6" : "#374151",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#9CA3AF" : "#6B7280",
      "&:hover": {
        backgroundColor: isDark ? "#374151" : "#D1D5DB",
        color: isDark ? "#EF4444" : "#DC2626",
      },
    }),
    input: (base) => ({ ...base, color: isDark ? "#FFFFFF" : "#111827" }),
  };

  const fetchAllProblems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching all problems:", error);
    else {
      setProblems(data || []);
      const allConcepts = (data || []).flatMap((row) => row.concepts || []);
      const uniqueConcepts = [...new Set(allConcepts)];
      setConceptOptions(uniqueConcepts.map((c) => ({ value: c, label: c })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllProblems();
  }, []);

  // Reset page index on any filter or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    pageSize,
    siteDifficultyFilter,
    personalDifficultyFilter,
    showBookmarkedOnly,
    sortBy,
    sortOrder,
  ]);

  const handleToggleBookmark = async (problemId, currentStatus) => {
    const newStatus = !currentStatus;

    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId ? { ...p, is_bookmarked: newStatus } : p,
      ),
    );

    const { error } = await supabase
      .from("problems")
      .update({ is_bookmarked: newStatus })
      .eq("id", problemId);

    if (error) {
      toast.error("Failed to sync bookmark status.");
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId ? { ...p, is_bookmarked: currentStatus } : p,
        ),
      );
    }
  };

  const triggerDeleteConfirmation = (problem) => {
    setProblemToDelete(problem);
    setDeleteModalOpen(true);
  };

  const executeFinalDelete = async () => {
    if (!problemToDelete) return;
    setLoading(true);
    const { error } = await supabase
      .from("problems")
      .delete()
      .eq("id", problemToDelete.id);
    if (error) {
      toast.error("Failed to delete record: " + error.message);
    } else {
      toast.success(`"${problemToDelete.problem_name}" permanently removed.`, {
        icon: "🗑️",
        style: {
          background: isDark ? "#1F2937" : "#FFFFFF",
          color: isDark ? "#FFFFFF" : "#111827",
        },
      });
      setProblems(problems.filter((p) => p.id !== problemToDelete.id));
    }
    setDeleteModalOpen(false);
    setProblemToDelete(null);
    setLoading(false);
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setEditFormData({
      personal_difficulty: problem.personal_difficulty || "Good",
      approach: problem.approach || "",
      mistakes: problem.mistakes || "",
    });
    setEditSelectedConcepts(
      (problem.concepts || []).map((c) => ({ value: c, label: c })),
    );
    setEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const targetTagsArray = editSelectedConcepts.map((c) => c.value);

    const { error } = await supabase
      .from("problems")
      .update({
        personal_difficulty: editFormData.personal_difficulty,
        approach: editFormData.approach,
        mistakes: editFormData.mistakes,
        concepts: targetTagsArray,
      })
      .eq("id", editingProblem.id);

    if (error) toast.error("Failed to modify metrics: " + error.message);
    else {
      toast.success("Metrics updated successfully!", {
        style: {
          background: isDark ? "#1F2937" : "#FFFFFF",
          color: isDark ? "#FFFFFF" : "#111827",
        },
      });
      setEditModalOpen(false);
      fetchAllProblems();
    }
    setLoading(false);
  };

  const handleBackupCSV = () => {
    if (problems.length === 0) return alert("No data available to export.");
    const headers = [
      "Problem Name",
      "URL",
      "Platform",
      "Concepts",
      "Site Difficulty",
      "Personal Difficulty",
      "Stage",
      "Bookmarked",
      "Last Revised",
      "Next Revision Due",
      "Approach",
      "Mistakes",
      "Logged At",
    ];
    const rows = problems.map((p) => [
      `"${p.problem_name.replace(/"/g, '""')}"`,
      `"${(p.url || "").replace(/"/g, '""')}"`,
      `"${p.platform}"`,
      `"${(p.concepts || []).join(", ")}"`,
      `"${p.site_difficulty}"`,
      `"${p.personal_difficulty}"`,
      `"${p.revision_stage}"`,
      `"${p.is_bookmarked ? "Yes" : "No"}"`,
      `"${p.last_revised}"`,
      `"${p.next_revision_due || ""}"`,
      `"${(p.approach || "").replace(/"/g, '""')}"`,
      `"${(p.mistakes || "").replace(/"/g, '""')}"`,
      `"${p.created_at}"`,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `dsa_tracker_backup_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReader = (problemName, textContent, noteType) => {
    if (!textContent) return;
    setModalContent({ title: problemName, text: textContent, type: noteType });
    setModalOpen(true);
  };

  // --- FILTER & SORT TRANSFORMATION PIPELINE ---
  const filteredProblems = problems.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
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

    const matchesBookmark = showBookmarkedOnly
      ? p.is_bookmarked === true
      : true;

    return matchesText && matchesSiteDiff && matchesPersDiff && matchesBookmark;
  });

  const sortedProblems = [...filteredProblems].sort((a, b) => {
    const dateA = new Date(a[sortBy] || a.created_at);
    const dateB = new Date(b[sortBy] || b.created_at);

    if (sortOrder === "desc") {
      return dateB - dateA; // Newest first
    } else {
      return dateA - dateB; // Oldest first
    }
  });

  const totalItems = sortedProblems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProblems = sortedProblems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4 mb-6">
          {/* HEADER ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                All Solved Problems
              </h2>
              {!loading && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800/50 shadow-sm whitespace-nowrap">
                  {totalItems} {totalItems === 1 ? "Problem" : "Problems"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className={`flex items-center gap-2 px-3 py-2 font-medium rounded-lg text-sm border shadow-sm transition-colors ${
                  showBookmarkedOnly
                    ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-400"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Bookmark
                  size={16}
                  className={showBookmarkedOnly ? "fill-current" : ""}
                />
                <span className="hidden sm:inline">
                  {showBookmarkedOnly ? "Bookmarked" : "Show Bookmarks"}
                </span>
              </button>

              <button
                onClick={handleBackupCSV}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg text-sm border border-gray-300 dark:border-gray-600 shadow-sm shrink-0"
              >
                <Download size={16} />{" "}
                <span className="hidden sm:inline">Backup CSV</span>
              </button>
            </div>
          </div>

          {/* --- OPTIMIZED FILTER CONTROL BAR LAYER --- */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 flex flex-col gap-4 transition-all">
            {/* Top Row: Always Visible (Search Bar & Mobile Toggle) */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search problems or concepts..."
                  className="w-full pl-9 p-2.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Mobile/Tablet Filter Toggle Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className={`xl:hidden flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-bold transition-all shadow-sm shrink-0 ${
                  isMobileFiltersOpen
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Expandable Dropdowns Grid */}
            <div
              className={`${isMobileFiltersOpen ? "grid" : "hidden"} xl:grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 items-end animate-fadeIn`}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                  Site Difficulty
                </span>
                <select
                  className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm cursor-pointer"
                  value={siteDifficultyFilter}
                  onChange={(e) => setSiteDifficultyFilter(e.target.value)}
                >
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                  Friction Felt
                </span>
                <select
                  className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm cursor-pointer"
                  value={personalDifficultyFilter}
                  onChange={(e) => setPersonalDifficultyFilter(e.target.value)}
                >
                  <option value="All">All Friction</option>
                  <option value="Simple">Simple</option>
                  <option value="Good">Good</option>
                  <option value="Difficult">Difficult</option>
                  <option value="Required PreReading">
                    Required Pre-Reading
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                  Sort By
                </span>
                <select
                  className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created_at">Date Added</option>
                  <option value="last_revised">Last Revised</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                  Order
                </span>
                <select
                  className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm cursor-pointer"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                  Per Page
                </span>
                <select
                  className="w-full p-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold shadow-sm cursor-pointer"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={10}>10 Items</option>
                  <option value={25}>25 Items</option>
                  <option value={50}>50 Items</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading && !editModalOpen && !deleteModalOpen ? (
          <div className="grid grid-cols-1 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : paginatedProblems.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 py-10 text-center text-sm font-medium font-mono">
            No problems logged matching these criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {paginatedProblems.map((p) => (
              <div
                key={p.id}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors relative group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 pr-0 md:pr-20">
                  <div className="flex items-center gap-3">
                    <PlatformLogo platform={p.platform} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {p.problem_name}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleBookmark(p.id, p.is_bookmarked);
                          }}
                          className="focus:outline-none focus:ring-0 ml-1"
                          title={
                            p.is_bookmarked ? "Remove Bookmark" : "Add Bookmark"
                          }
                        >
                          <Bookmark
                            size={18}
                            className={`transition-colors ${
                              p.is_bookmarked
                                ? "text-amber-500 fill-amber-500"
                                : "text-gray-300 dark:text-gray-600 hover:text-amber-400 dark:hover:text-amber-400"
                            }`}
                          />
                        </button>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:text-blue-700 ml-1"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Added: {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StageBadge stage={p.revision_stage} />
                    <DifficultyChip label={p.site_difficulty} type="site" />
                    <DifficultyChip
                      label={p.personal_difficulty}
                      type="personal"
                    />
                  </div>
                </div>

                <div className="absolute top-5 right-5 flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => triggerDeleteConfirmation(p)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg border border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Concepts
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {p.concepts?.length > 0 ? (
                          p.concepts.map((c) => (
                            <span
                              key={c}
                              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-sm"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                          Last Revised
                        </span>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                          {p.last_revised}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                          Next Due
                        </span>
                        <span className="text-sm font-medium dark:text-gray-200">
                          {p.next_revision_due || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div
                      onClick={() =>
                        openReader(p.problem_name, p.approach, "Approach")
                      }
                      className={`p-3 rounded-lg border ${p.approach ? "cursor-pointer hover:bg-blue-100/40 dark:hover:bg-blue-900/20" : ""} bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30`}
                    >
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1 uppercase tracking-wider">
                        <FileText size={14} /> Approach
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                        {p.approach || "No approach recorded."}
                      </p>
                    </div>
                    <div
                      onClick={() =>
                        openReader(p.problem_name, p.mistakes, "Mistakes")
                      }
                      className={`p-3 rounded-lg border ${p.mistakes ? "cursor-pointer hover:bg-red-100/40 dark:hover:bg-red-900/20" : ""} bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30`}
                    >
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mb-1 uppercase tracking-wider">
                        <AlertTriangle size={14} /> Mistakes
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                        {p.mistakes || "No mistakes recorded."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
              total entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1 text-sm font-medium">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg transition-all ${currentPage === pageNum ? "bg-blue-600 text-white shadow-md font-bold" : "border text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold">Confirm Destruction</h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  "{problemToDelete?.problem_name}"
                </span>
                ?
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/30">
                🚀 Think twice! This completely vaporizes the problem from your
                universe. Gone. Poof. No undo button here!
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProblemToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={executeFinalDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reader Modals */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 transition-all">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${modalContent.type === "Approach" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"}`}
                >
                  {modalContent.type}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {modalContent.title}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-sans">
                {modalContent.text}
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold shadow-sm"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modals */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Modify Logs & Metadata
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Editing values for:{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {editingProblem?.problem_name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleUpdateSubmit}
              className="overflow-y-auto flex-1 p-6 space-y-5 max-h-[calc(90vh-140px)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Concepts Covered
                  </label>
                  <CreatableSelect
                    isMulti
                    options={conceptOptions}
                    value={editSelectedConcepts}
                    styles={selectDarkStyles}
                    placeholder="Select or tag new concept..."
                    onChange={(selected) =>
                      setEditSelectedConcepts(selected || [])
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Difficulty I Faced
                  </label>
                  <select
                    className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={editFormData.personal_difficulty}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        personal_difficulty: e.target.value,
                      })
                    }
                  >
                    <option value="Simple">Simple</option>
                    <option value="Good">Good</option>
                    <option value="Difficult">Difficult</option>
                    <option value="Required PreReading">
                      Required Pre-Reading
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Your Approach
                </label>
                <textarea
                  rows="6"
                  className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-sans"
                  value={editFormData.approach}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      approach: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Mistakes / Optimization Notes
                </label>
                <textarea
                  rows="4"
                  className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-sans"
                  value={editFormData.mistakes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      mistakes: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/20 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
