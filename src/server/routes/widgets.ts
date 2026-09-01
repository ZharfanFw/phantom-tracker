import { Hono } from 'hono';
import { dbService } from '../db/index.ts';
import { calculateStreakStats, generateContributionGrid, getTodayDateString } from '../services/streak.ts';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export const widgetsRouter = new Hono();

// Helper to format greeting
function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return 'Rise & Grind, Joker';
  if (hour >= 12 && hour < 17) return 'Keep The Momentum';
  if (hour >= 17 && hour < 21) return 'Mission In Progress';
  return 'Steal The Night';
}

// GET /api/widgets/today - Comprehensive summary payload for widgets
widgetsRouter.get('/today', async (c) => {
  try {
    const todayStr = getTodayDateString();

    // 1. Get habits with grid data
    const activeHabits = await dbService.getHabits();

    const habitsSummary = await Promise.all(
      activeHabits.map(async (habit) => {
        const checkins = await dbService.getCheckins(habit.id);
        const stats = calculateStreakStats(checkins, habit.targetCount, habit.type);
        // 84 days = 12 weeks of cells for commit grid widget
        const gridCells = generateContributionGrid(checkins, 84, habit.targetCount, habit.type);

        return {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          type: habit.type,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          checkedToday: stats.checkedToday,
          completionRate30d: stats.completionRate30d,
          grid: gridCells,
        };
      })
    );

    // 2. Get todos
    const allTodos = await dbService.getTodos('all', 30);
    const pendingTodos = allTodos.filter((t) => !t.isDone);
    const completedTodos = allTodos.filter((t) => t.isDone);

    const now = new Date();
    const formattedDate = format(now, 'EEEE, d MMMM yyyy', { locale: idLocale });
    const greeting = getGreeting(now.getHours());

    const totalHabits = habitsSummary.length;
    const habitsDoneToday = habitsSummary.filter((h) => h.checkedToday).length;

    return c.json({
      success: true,
      meta: {
        date: todayStr,
        formattedDate,
        greeting,
        updatedAt: now.toISOString(),
      },
      habits: {
        total: totalHabits,
        doneToday: habitsDoneToday,
        allDone: totalHabits > 0 && habitsDoneToday === totalHabits,
        items: habitsSummary,
      },
      todos: {
        total: allTodos.length,
        totalPending: pendingTodos.length,
        totalCompleted: completedTodos.length,
        items: allTodos.map((t) => ({
          id: t.id,
          title: t.title,
          source: t.source,
          isDone: t.isDone,
          createdAt: t.createdAt,
        })),
        pending: pendingTodos.map((t) => ({ id: t.id, title: t.title, source: t.source, isDone: false })),
        completed: completedTodos.map((t) => ({ id: t.id, title: t.title, source: t.source, isDone: true })),
      },
    });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});
