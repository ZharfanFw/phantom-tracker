import { Hono } from 'hono';
import { dbService } from '../db/index.ts';
import { calculateStreakStats, generateContributionGrid, getTodayDateString } from '../services/streak.ts';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export const widgetsRouter = new Hono();

// GET /api/widgets/today - Compact payload for iOS Widget (Scriptable / Shortcuts)
widgetsRouter.get('/today', async (c) => {
  try {
    const todayStr = getTodayDateString();

    // 1. Get habits
    const activeHabits = await dbService.getHabits();

    const habitsSummary = await Promise.all(
      activeHabits.map(async (habit) => {
        const checkins = await dbService.getCheckins(habit.id);
        const stats = calculateStreakStats(checkins, habit.targetCount, habit.type);
        const recentMini = generateContributionGrid(checkins, 14, habit.targetCount, habit.type);

        return {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          type: habit.type,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          checkedToday: stats.checkedToday,
          miniHistory: recentMini.map((m) => (m.isChecked ? 1 : 0)),
        };
      })
    );

    // 2. Get todos
    const allTodos = await dbService.getTodos('all', 20);
    const pendingTodos = allTodos.filter((t) => !t.isDone);
    const completedTodos = allTodos.filter((t) => t.isDone);

    // 3. Formatting
    const now = new Date();
    const formattedDate = format(now, 'EEEE, d MMMM yyyy', { locale: idLocale });

    const hour = now.getHours();
    let phantomGreeting = 'Take Your Time';
    if (hour >= 5 && hour < 12) phantomGreeting = 'Rise & Grind, Joker';
    else if (hour >= 12 && hour < 17) phantomGreeting = 'Keep The Momentum';
    else if (hour >= 17 && hour < 21) phantomGreeting = 'Mission In Progress';
    else phantomGreeting = 'Steal The Night';

    const totalHabits = habitsSummary.length;
    const habitsDoneToday = habitsSummary.filter((h) => h.checkedToday).length;

    return c.json({
      success: true,
      meta: {
        date: todayStr,
        formattedDate,
        greeting: phantomGreeting,
        updatedAt: now.toISOString(),
      },
      habits: {
        total: totalHabits,
        doneToday: habitsDoneToday,
        allDone: totalHabits > 0 && habitsDoneToday === totalHabits,
        items: habitsSummary,
      },
      todos: {
        totalPending: pendingTodos.length,
        totalCompleted: completedTodos.length,
        pending: pendingTodos.map((t) => ({ id: t.id, title: t.title, source: t.source })),
        completed: completedTodos.slice(0, 5).map((t) => ({ id: t.id, title: t.title })),
      },
    });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});
