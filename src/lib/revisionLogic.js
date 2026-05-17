// NEW HELPER: Gets the exact local date, completely ignoring UTC
export function getLocalYMD(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function calculateNextRevision(currentStage) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  let nextDate = new Date(today);
  let nextStage = currentStage;

  switch (currentStage) {
    case "NEXT_DAY":
      nextStage = "WEEKEND";
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        nextDate.setDate(today.getDate() + (7 - dayOfWeek) + 7);
      } else if (dayOfWeek === 0) {
        nextDate.setDate(today.getDate() + 7);
      } else {
        nextDate.setDate(today.getDate() + (7 - dayOfWeek));
      }
      break;

    case "WEEKEND":
      nextStage = "MONTHLY";
      nextDate.setDate(today.getDate() + 21);
      break;

    case "MONTHLY":
      nextStage = "AD_HOC";
      nextDate.setMonth(today.getMonth() + 6);
      break;

    case "AD_HOC":
      nextStage = "AD_HOC";
      nextDate.setMonth(today.getMonth() + 6);
      break;
  }

  return {
    nextStage,
    // Use the new local timezone helper instead of toISOString()
    nextDate: getLocalYMD(nextDate),
  };
}
