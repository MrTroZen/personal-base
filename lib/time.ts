export const OWNER_TIME_ZONE = "Asia/Dhaka";

export function ownerDateKey(date = new Date(), timeZone = OWNER_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function zonedDateTimeToUtc(dateKey: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  let timestamp = Date.UTC(year, month - 1, day);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map((part) => [part.type, part.value]));
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    timestamp -= represented - Date.UTC(year, month - 1, day);
  }
  return timestamp;
}

export function focusRangeStarts(date: Date, timeZone: string, weekStart: "monday" | "sunday") {
  const todayKey = ownerDateKey(date, timeZone);
  const [year, month, day] = todayKey.split("-").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = calendarDate.getUTCDay();
  const offset = weekStart === "sunday" ? dayOfWeek : (dayOfWeek + 6) % 7;
  calendarDate.setUTCDate(calendarDate.getUTCDate() - offset);
  const weekKey = `${calendarDate.getUTCFullYear()}-${String(calendarDate.getUTCMonth() + 1).padStart(2, "0")}-${String(calendarDate.getUTCDate()).padStart(2, "0")}`;
  return {
    today: zonedDateTimeToUtc(todayKey, timeZone),
    week: zonedDateTimeToUtc(weekKey, timeZone),
  };
}

export function nextMonthStart(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
