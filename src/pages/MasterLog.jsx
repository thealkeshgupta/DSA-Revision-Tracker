import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { supabase } from "../lib/supabase";
import { getLocalYMD } from "../lib/revisionLogic";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function MasterLog() {
  const [loading, setLoading] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false); // New state to show title auto-loading progress
  const [conceptOptions, setConceptOptions] = useState([]);
  const [isDark, setIsDark] = useState(false);

  const [formData, setFormData] = useState({
    problem_name: "",
    url: "",
    platform: "LeetCode",
    site_difficulty: "Medium",
    personal_difficulty: "Good",
    approach: "",
    mistakes: "",
  });

  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
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

  useEffect(() => {
    const fetchExistingConcepts = async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("concepts");
      if (error) console.error("Error fetching concepts:", error);

      const allConcepts = (data || []).flatMap((row) => row.concepts || []);
      const uniqueConcepts = [...new Set(allConcepts)];
      const dynamicOptions = uniqueConcepts.map((c) => ({
        value: c,
        label: c,
      }));

      const baseOptions = [
        { value: "Arrays", label: "Arrays" },
        { value: "Strings", label: "Strings" },
        { value: "LinkedList", label: "LinkedList" },
        { value: "Trees", label: "Trees" },
        { value: "Dynamic Programming", label: "Dynamic Programming" },
      ];

      const mergedOptions = [...baseOptions, ...dynamicOptions];
      const finalUniqueOptions = Array.from(
        new Map(mergedOptions.map((item) => [item.value, item])).values(),
      );
      setConceptOptions(finalUniqueOptions);
    };
    fetchExistingConcepts();
  }, []);

  const handleUrlBlur = (e) => {
    const url = e.target.value.trim();
    if (!url) return;

    // 1. Detect and auto-select the platform dropdown state matching the URL
    let detectedPlatform = "Others";
    if (url.includes("leetcode.com")) detectedPlatform = "LeetCode";
    else if (url.includes("geeksforgeeks.org")) detectedPlatform = "GFG";
    else if (url.includes("scaler.com")) detectedPlatform = "Scaler";

    setFormData((prev) => ({ ...prev, platform: detectedPlatform }));

    try {
      let slug = "";

      // 2. Safely parse out the relative resource slug using platform-specific regex matches
      if (detectedPlatform === "LeetCode") {
        // Matches the string between /problems/ and the next forward slash
        const match = url.match(/\/problems\/([a-zA-Z0-9-]+)/);
        if (match && match[1]) slug = match[1];
      } else if (detectedPlatform === "GFG") {
        // Matches the string after /problems/ or the final path chunk
        const match = url.match(/\/problems\/([a-zA-Z0-9-]+)/);
        if (match && match[1]) {
          slug = match[1];
        } else {
          // Fallback if it's an older GFG article style link structure
          const paths = url.split("/").filter(Boolean);
          slug = paths[paths.length - 1];
        }
      } else if (detectedPlatform === "Scaler") {
        // Slices out the core identifier chunk from Scaler paths
        const paths = url.split("/").filter(Boolean);
        slug = paths[paths.length - 1];
      }

      // If a slug was isolated successfully, format it into a standard Title string
      if (slug) {
        // A: Swap all hyphens/dashes out for clean spaces ('two-sum' -> 'two sum')
        let cleanName = slug.replace(/-/g, " ");

        // B: Strip trailing numeric tracking hashes if present in URL structures
        cleanName = cleanName.replace(/\d+$/, "").trim();

        // C: Title-Case conversion ('two sum' -> 'Two Sum')
        const formattedTitle = cleanName
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // 3. Drop the beautifully formatted title straight into your input box state instantly
        if (formattedTitle && formattedTitle.length > 2) {
          setFormData((prev) => ({ ...prev, problem_name: formattedTitle }));
        }
      }
    } catch (err) {
      console.error("Slug parser warning:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const conceptsArray = selectedConcepts.map((c) => c.value);

    const { error } = await supabase.from("problems").insert([
      {
        ...formData,
        user_id: user.id,
        concepts: conceptsArray,
        next_revision_due: getLocalYMD(tomorrow),
      },
    ]);

    if (error) {
      toast.error("Error saving problem: " + error.message);
    } else {
      toast.success("Problem logged and revision scheduled!", {
        style: {
          background: document.documentElement.classList.contains("dark")
            ? "#1F2937"
            : "#FFFFFF",
          color: document.documentElement.classList.contains("dark")
            ? "#FFFFFF"
            : "#111827",
        },
      });
      setFormData({
        problem_name: "",
        url: "",
        platform: "LeetCode",
        site_difficulty: "Medium",
        personal_difficulty: "Good",
        approach: "",
        mistakes: "",
      });
      setSelectedConcepts([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Log New Problem
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* We swapped the visual orientation so pasting the URL comes first to naturally drive the Title field update */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Problem URL
            </label>
            <input
              type="url"
              required
              placeholder="Paste problem link here..."
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              onBlur={
                handleUrlBlur
              } /* Triggers automatic fetch stream when you click out or hit tab */
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Problem Name{" "}
              {fetchingTitle && (
                <span className="text-xs text-blue-500 animate-pulse ml-2">
                  (Fetching titles...)
                </span>
              )}
            </label>
            <input
              required
              type="text"
              placeholder={
                fetchingTitle
                  ? "Inspecting link metadata..."
                  : "Auto-filled if link is pasted, or type manually"
              }
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${fetchingTitle ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-400" : ""}`}
              value={formData.problem_name}
              onChange={(e) =>
                setFormData({ ...formData, problem_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Platform
            </label>
            <select
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.platform}
              onChange={(e) =>
                setFormData({ ...formData, platform: e.target.value })
              }
            >
              <option value="LeetCode">LeetCode</option>
              <option value="GFG">GeeksForGeeks (GFG)</option>
              <option value="Scaler">Scaler</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Concepts Used
            </label>
            <CreatableSelect
              isMulti
              options={conceptOptions}
              value={selectedConcepts}
              styles={selectDarkStyles}
              placeholder="Select or type a new concept..."
              onChange={(selected) => setSelectedConcepts(selected || [])}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Problem Difficulty (Site)
            </label>
            <select
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.site_difficulty}
              onChange={(e) =>
                setFormData({ ...formData, site_difficulty: e.target.value })
              }
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Difficulty I Faced
            </label>
            <select
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.personal_difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personal_difficulty: e.target.value,
                })
              }
            >
              <option value="Simple">Simple</option>
              <option value="Good">Good</option>
              <option value="Difficult">Difficult</option>
              <option value="Required PreReading">Required Pre-Reading</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Your Approach
            </label>
            <textarea
              rows="3"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.approach}
              onChange={(e) =>
                setFormData({ ...formData, approach: e.target.value })
              }
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Mistakes / Notes
            </label>
            <textarea
              rows="2"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.mistakes}
              onChange={(e) =>
                setFormData({ ...formData, mistakes: e.target.value })
              }
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
        >
          {loading ? "Saving..." : "Save Problem & Schedule Revision"}
        </button>
      </form>
    </div>
  );
}
