import { Hono } from 'hono';
import { dbService } from '../db/index.ts';
import { getTodayDateString } from '../services/streak.ts';

export const checkinsRouter = new Hono();

// GET /api/habits/:id/checkins - Get all checkin history for a habit
checkinsRouter.get('/:id/checkins', async (c) => {
  try {
    const habitId = c.req.param('id');
    const logs = await dbService.getCheckins(habitId);
    return c.json({ success: true, checkins: logs });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// POST /api/habits/:id/checkins - Toggle or update checkin for a specific date
checkinsRouter.post('/:id/checkins', async (c) => {
  try {
    const habitId = c.req.param('id');
    let body: { date?: string; value?: number; mode?: 'toggle' | 'set' | 'increment' } = {};
    try {
      body = await c.req.json();
    } catch {
      // Empty body is fine, defaults to today
    }

    const targetDate = body.date || getTodayDateString();
    const mode = body.mode || 'toggle';

    const result = await dbService.toggleCheckin(habitId, targetDate, mode, body.value);

    return c.json({
      success: true,
      date: targetDate,
      isChecked: result.isChecked,
      value: result.value,
      stats: result.stats,
    });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});
