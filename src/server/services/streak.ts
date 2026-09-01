import { format, subDays, addDays, parseISO, differenceInCalendarDays } from 'date-fns';

export interface HabitStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  checkedToday: boolean;
  checkedYesterday: boolean;
  completionRate30d: number;
}

export interface DayCell {
  date: string; // 'YYYY-MM-DD'
  value: number;
  isChecked: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
}

/**
 * Get today's local date string 'YYYY-MM-DD'
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Calculate streak stats from a list of checkin records
 */
export function calculateStreakStats(
  checkins: { checkedAt: string; value: number }[],
  targetCount: number = 1,
  type: string = 'boolean'
): HabitStreakStats {
  const todayStr = getTodayDateString();
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  if (!checkins || checkins.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckins: 0,
      checkedToday: false,
      checkedYesterday: false,
      completionRate30d: 0,
    };
  }

  // Map of date string -> boolean satisfied
  const checkinMap = new Map<string, { value: number; satisfied: boolean }>();
  for (const c of checkins) {
    // For boolean, value >= 1 is satisfied; for count, value >= targetCount
    const satisfied = type === 'count' ? c.value >= targetCount : c.value >= 1;
    checkinMap.set(c.checkedAt, { value: c.value, satisfied });
  }

  const checkedToday = checkinMap.get(todayStr)?.satisfied ?? false;
  const checkedYesterday = checkinMap.get(yesterdayStr)?.satisfied ?? false;

  // Calculate Current Streak
  let currentStreak = 0;
  let checkDate = new Date();

  // If checked today, start counting from today backwards
  if (checkedToday) {
    let curr = checkDate;
    while (true) {
      const dStr = format(curr, 'yyyy-MM-dd');
      if (checkinMap.get(dStr)?.satisfied) {
        currentStreak++;
        curr = subDays(curr, 1);
      } else {
        break;
      }
    }
  } else if (checkedYesterday) {
    // If not checked today but checked yesterday, streak is still active
    let curr = subDays(checkDate, 1);
    while (true) {
      const dStr = format(curr, 'yyyy-MM-dd');
      if (checkinMap.get(dStr)?.satisfied) {
        currentStreak++;
        curr = subDays(curr, 1);
      } else {
        break;
      }
    }
  }

  // Calculate Longest Streak
  // Sort all unique satisfied dates ascending
  const satisfiedDates = Array.from(checkinMap.entries())
    .filter(([_, data]) => data.satisfied)
    .map(([d]) => d)
    .sort();

  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dStr of satisfiedDates) {
    const d = parseISO(dStr);
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diff = differenceInCalendarDays(d, lastDate);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    lastDate = d;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Calculate 30-day completion rate
  let last30DaysCount = 0;
  for (let i = 0; i < 30; i++) {
    const dStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (checkinMap.get(dStr)?.satisfied) {
      last30DaysCount++;
    }
  }
  const completionRate30d = Math.round((last30DaysCount / 30) * 100);

  return {
    currentStreak,
    longestStreak,
    totalCheckins: satisfiedDates.length,
    checkedToday,
    checkedYesterday,
    completionRate30d,
  };
}

/**
 * Generate full contribution grid dataset for N days (default 365 days / 52 weeks)
 */
export function generateContributionGrid(
  checkins: { checkedAt: string; value: number }[],
  daysCount: number = 365,
  targetCount: number = 1,
  type: string = 'boolean'
): DayCell[] {
  const checkinMap = new Map<string, number>();
  for (const c of checkins) {
    checkinMap.set(c.checkedAt, c.value);
  }

  const todayStr = getTodayDateString();
  const cells: DayCell[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const val = checkinMap.get(dateStr) || 0;
    const isChecked = type === 'count' ? val >= targetCount : val >= 1;

    cells.push({
      date: dateStr,
      value: val,
      isChecked,
      isToday: dateStr === todayStr,
      dayOfWeek: d.getDay(),
    });
  }

  return cells;
}
