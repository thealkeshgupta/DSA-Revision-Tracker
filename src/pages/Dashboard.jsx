import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  BookOpen,
  Calendar,
  Award,
  Flame,
  Trophy,
  ChevronRight,
} from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const hasFetchedData = useRef(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSolved: 0,
    nextDayQueue: 0,
    weekendQueue: 0,
    monthlyQueue: 0,
    masteredPool: 0,
  });

  const [monthsData, setMonthsData] = useState([]);
  const [streaks, setStreaks] = useState({ current: 0, max: 0 });

  // --- SINGLE BULLETPROOF STATE-DRIVEN TOOLTIP TRACKER ---
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // CRITICAL RLS GUARD: Wait silently for the user session token to initialize
      if (!user?.id) return;

      // BLOCKER: If the data has already been fetched once, break out immediately
      if (hasFetchedData.current) return;

      setLoading(true);
      try {
        const now = new Date();

        // Format dates cleanly mapping local timezone components instead of raw UTC strings
        const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        let weekendTargetDate = localTodayStr;
        if (now.getDay() === 6) {
          const tomorrow = new Date();
          tomorrow.setDate(now.getDate() + 1);
          weekendTargetDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
        }

        let monthlyTargetDate = localTodayStr;
        const totalDaysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).getDate();
        const daysRemainingInMonth = totalDaysInMonth - now.getDate();
        if (daysRemainingInMonth <= 7) {
          const endOfMonth = new Date();
          endOfMonth.setDate(now.getDate() + daysRemainingInMonth);
          monthlyTargetDate = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, "0")}-${String(endOfMonth.getDate()).padStart(2, "0")}`;
        }

        // --- SECURE MULTI-TENANT STATISTICS READOUTS ---
        const { count: total } = await supabase
          .from("problems")
          .select("*", { count: "exact", head: true });
        const { count: nextDay } = await supabase
          .from("problems")
          .select("*", { count: "exact", head: true })
          .eq("revision_stage", "NEXT_DAY")
          .lte("next_revision_due", localTodayStr);
        const { count: weekend } = await supabase
          .from("problems")
          .select("*", { count: "exact", head: true })
          .eq("revision_stage", "WEEKEND")
          .lte("next_revision_due", weekendTargetDate);
        const { count: monthly } = await supabase
          .from("problems")
          .select("*", { count: "exact", head: true })
          .eq("revision_stage", "MONTHLY")
          .lte("next_revision_due", monthlyTargetDate);
        const { count: mastered } = await supabase
          .from("problems")
          .select("*", { count: "exact", head: true })
          .eq("revision_stage", "AD_HOC");

        setStats({
          totalSolved: total || 0,
          nextDayQueue: nextDay || 0,
          weekendQueue: weekend || 0,
          monthlyQueue: monthly || 0,
          masteredPool: mastered || 0,
        });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        const { data: records } = await supabase
          .from("problems")
          .select("created_at, revision_history")
          .gte("created_at", oneYearAgo.toISOString());

        // --- STREAK AND ACTIVITY COMPUTE ENGINE ---
        const countsByDate = {};
        (records || []).forEach((item) => {
          const createdDate = item.created_at.split("T")[0];
          countsByDate[createdDate] = (countsByDate[createdDate] || 0) + 1;

          if (item.revision_history && Array.isArray(item.revision_history)) {
            item.revision_history.forEach((historyTimestamp) => {
              const rDate = historyTimestamp.split("T")[0];
              if (rDate !== createdDate) {
                countsByDate[rDate] = (countsByDate[rDate] || 0) + 1;
              }
            });
          }
        });

        // Calculate active live current streak tracking backward from today
        let currentStreak = 0;
        const checkDate = new Date();
        let gapCount = 0;
        while (gapCount <= 1) {
          const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
          if (countsByDate[checkStr] && countsByDate[checkStr] > 0) {
            currentStreak++;
            gapCount = 0;
          } else {
            if (checkStr === localTodayStr) {
              gapCount = 1;
            } else {
              break;
            }
          }
          checkDate.setDate(checkDate.getDate() - 1);
        }

        // Calculate maximum historical streak across the 365-day pool
        let maxStreak = currentStreak;
        let runningStreak = 0;
        const streakScanner = new Date(oneYearAgo);

        while (streakScanner <= now) {
          const checkStr = `${streakScanner.getFullYear()}-${String(streakScanner.getMonth() + 1).padStart(2, "0")}-${String(streakScanner.getDate()).padStart(2, "0")}`;
          if (countsByDate[checkStr] && countsByDate[checkStr] > 0) {
            runningStreak++;
            if (runningStreak > maxStreak) maxStreak = runningStreak;
          } else {
            runningStreak = 0;
          }
          streakScanner.setDate(streakScanner.getDate() + 1);
        }

        setStreaks({ current: currentStreak, max: maxStreak });

        // --- MATRIX MONTH GROUPINGS MAPPER ---
        const monthGroupings = [];
        const trackingDate = new Date(oneYearAgo);

        const initialOffset = trackingDate.getDay();
        trackingDate.setDate(trackingDate.getDate() - initialOffset);

        const targetEndLimit = new Date(now);
        targetEndLimit.setHours(23, 59, 59, 999);

        const monthNames = [
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
        ];
        let currentYear = oneYearAgo.getFullYear();
        let targetMonthIndex = oneYearAgo.getMonth();

        for (let i = 0; i < monthNames.length; i++) {
          const mName = monthNames[i];
          if (mName === "Jan" && monthNames[i - 1] === "Dec") {
            currentYear++;
            targetMonthIndex = 0;
          }

          const monthDaysList = [];
          let loopDate = new Date(currentYear, targetMonthIndex, 1);
          const endLimitDate = new Date(currentYear, targetMonthIndex + 1, 0);

          if (i === 0) {
            loopDate = new Date(oneYearAgo);
          }

          while (loopDate <= endLimitDate && loopDate <= targetEndLimit) {
            const currentDateString = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, "0")}-${String(loopDate.getDate()).padStart(2, "0")}`;

            monthDaysList.push({
              dateStr: currentDateString,
              count: countsByDate[currentDateString] || 0,
              dayOfWeek: loopDate.getDay(),
              displayDate: loopDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              }),
            });
            loopDate.setDate(loopDate.getDate() + 1);
          }

          if (monthDaysList.length > 0) {
            monthGroupings.push({
              label: mName,
              days: monthDaysList,
            });
          }

          targetMonthIndex = (targetMonthIndex + 1) % 12;
        }

        setMonthsData(monthGroupings);

        // LOCK THE GATE: Set ref to true so subsequent focus remounts skip fetching entirely
        hasFetchedData.current = true;
      } catch (error) {
        console.error("Dashboard matrix synchronization failure:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getColorClass = (count) => {
    if (count === 0)
      return "bg-gray-100 dark:bg-gray-700/50 border-gray-200/30 dark:border-gray-600/20";
    if (count <= 1)
      return "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200/20 dark:border-emerald-900/10";
    if (count <= 3)
      return "bg-emerald-300 dark:bg-emerald-800/70 border-emerald-400/20 dark:border-emerald-700/10";
    if (count <= 5)
      return "bg-emerald-500 dark:bg-emerald-500 border-emerald-600/20";
    return "bg-emerald-700 dark:bg-emerald-400 border-emerald-800/20";
  };

  const handleMouseEnterCell = (e, day) => {
    const rect = e.target.getBoundingClientRect();
    const containerRect = e.target
      .closest(".matrix-wrapper")
      .getBoundingClientRect();

    setActiveTooltip({
      count: day.count,
      displayDate: day.displayDate,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.bottom - containerRect.top + 8,
    });
  };

  if (loading) {
    return <LoadingScreen message="Aggregating metric snapshots..." />;
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Welcome Back, {user?.email ? user.email.split("@")[0] : "Developer"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here is the current status of your DSA repetition pipelines.
        </p>
      </div>

      {/* --- 1. FULL WIDTH METRIC HEADER CARDS (STAYS ON TOP) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Total Solved
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {stats.totalSolved}
            </p>
          </div>
        </div>

        <Link
          to="/next-day"
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:border-amber-500 dark:hover:border-amber-400 transition-all group"
        >
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider group-hover:text-amber-500 transition-colors">
              Next Day Due
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {stats.nextDayQueue}
            </p>
          </div>
        </Link>

        <Link
          to="/weekend"
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group"
        >
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
              Weekend Queue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {stats.weekendQueue}
            </p>
          </div>
        </Link>

        <Link
          to="/monthly"
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:border-purple-500 dark:hover:border-purple-400 transition-all group"
        >
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider group-hover:text-purple-500 transition-colors">
              Monthly Queue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {stats.monthlyQueue}
            </p>
          </div>
        </Link>
      </div>

      {/* --- 2. LOWER SPLIT GRID CONTAINER (MATRIX + ADHOC VS STREAK) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ================= LEFT SUBPART: MATRIX + AD-HOC (Spans 3 Columns) ================= */}
        <div className="lg:col-span-3 space-y-5 min-w-0">
          {/* CONSISTENCY MATRIX CARD */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
              Consistency Matrix
            </h3>

            <div className="w-full relative matrix-wrapper">
              <div className="overflow-x-auto lg:overflow-x-visible pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 w-full">
                {/* REMOVED min-w-[760px] entirely. 
                  Used w-max on mobile so it hugs the actual content tightly with zero trailing gap, 
                  and switched back to full w-full distribution on desktop.
                */}
                <div className="flex flex-nowrap lg:justify-between justify-start items-start gap-1.5 xl:gap-2 w-max lg:w-full mx-auto px-1 select-none">
                  {monthsData.map((month, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex flex-col gap-1.5 text-center shrink-0 items-start flex-none lg:flex-1 max-w-max"
                    >
                      {/* Month Column Title Element */}
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 pl-0.5 tracking-wider uppercase block select-none h-4">
                        {month.label}
                      </span>

                      {/* 7-Row Grid Pipeline */}
                      <div className="grid grid-rows-7 grid-flow-col gap-[2px] auto-cols-max justify-start">
                        {/* Adjust alignment offset matching the first cell day assignment */}
                        {mIdx === 0 &&
                          Array.from({ length: month.days[0].dayOfWeek }).map(
                            (_, padIdx) => (
                              <div
                                key={`pad-${padIdx}`}
                                className="w-[8px] h-[8px] xl:w-[9px] xl:h-[9px] aspect-square bg-transparent pointer-events-none"
                              />
                            ),
                          )}

                        {month.days.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            className={`w-[8px] h-[8px] xl:w-[9px] xl:h-[9px] aspect-square rounded-[1.5px] border transition-transform duration-75 hover:scale-125 cursor-pointer ${getColorClass(day.count)}`}
                            onMouseEnter={(e) => handleMouseEnterCell(e, day)}
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeTooltip && (
                <div
                  style={{
                    left: `${activeTooltip.x}px`,
                    top: `${activeTooltip.y}px`,
                  }}
                  className="absolute -translate-x-1/2 pointer-events-none z-50 px-2 py-0.5 text-[9px] font-medium tracking-wide rounded border shadow-md whitespace-nowrap bg-white/95 dark:bg-gray-900/95 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-700/40 backdrop-blur-sm transition-opacity duration-75 animate-fadeIn"
                >
                  <span className="font-bold text-gray-900 dark:text-white">
                    {activeTooltip.count}
                  </span>{" "}
                  {activeTooltip.count === 1 ? "activity" : "activities"} •{" "}
                  {activeTooltip.displayDate}
                </div>
              )}
            </div>
          </div>

          {/* MASTERED COLLECTION (AD-HOC) NESTED DIRECTLY UNDER MATRIX */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  Mastered Collection (Ad-Hoc)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xl">
                  Problems completely internalized that no longer need
                  high-frequency repeating schedules.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 py-2 px-4 rounded-xl min-w-[110px]">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block leading-none">
                {stats.masteredPool}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                Items Vaulted
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SUBPART: STREAK TRACKER (Claiming 1 Column) ================= */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 flex flex-col justify-between gap-4 self-stretch">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Streak Tracker
            </h3>

            <div className="space-y-3">
              {/* Current Active Streak */}
              <div className="flex items-center gap-3.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 p-3 rounded-xl">
                <div
                  className={`p-2 rounded-lg shrink-0 ${streaks.current > 0 ? "bg-amber-100 dark:bg-amber-950/40 text-amber-500" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}
                >
                  <Flame
                    size={20}
                    className={streaks.current > 0 ? "fill-current" : ""}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Current Streak
                  </span>
                  <p className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                    {streaks.current}{" "}
                    <span className="text-xs font-semibold text-gray-400 font-mono">
                      days
                    </span>
                  </p>
                </div>
              </div>

              {/* Max Record Streak */}
              <div className="flex items-center gap-3.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 p-3 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Max Record
                  </span>
                  <p className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                    {streaks.max}{" "}
                    <span className="text-xs font-semibold text-gray-400 font-mono">
                      days
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Motivation Text Block */}
          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 leading-normal bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg border border-gray-100 dark:border-gray-800/60 font-mono text-center mt-auto">
            {streaks.current > 0
              ? "⚡ Maintain the chain! Log another problem tomorrow."
              : "❄️ Pipeline cold. Log an activity today to spark a new streak."}
          </p>
        </div>
      </div>
    </div>
  );
}
