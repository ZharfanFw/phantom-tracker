import { Hono } from 'hono';
import { dbService } from '../db/index.ts';
import { calculateStreakStats, generateContributionGrid } from '../services/streak.ts';

export const habitsRouter = new Hono();

// GET /api/habits - List all active habits with streak summary
habitsRouter.get('/', async (c) => {
  try {
    const allHabits = await dbService.getHabits();

    const results = await Promise.all(
      allHabits.map(async (habit) => {
        const checkins = await dbService.getCheckins(habit.id);
        const stats = calculateStreakStats(checkins, habit.targetCount, habit.type);
        const recentGrid = generateContributionGrid(checkins, 90, habit.targetCount, habit.type);

        return {
          ...habit,
          stats,
          recentGrid,
        };
      })
    );

    return c.json({ success: true, habits: results });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// GET /api/habits/:id - Detailed habit with full 365-day grid
habitsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const habit = await dbService.getHabitById(id);

    if (!habit) {
      return c.json({ success: false, error: 'Habit not found' }, 404);
    }

    const checkins = await dbService.getCheckins(habit.id);
    const stats = calculateStreakStats(checkins, habit.targetCount, habit.type);
    const fullGrid = generateContributionGrid(checkins, 365, habit.targetCount, habit.type);

    return c.json({
      success: true,
      habit: {
        ...habit,
        stats,
        grid: fullGrid,
      },
    });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// POST /api/habits - Create new habit
habitsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, color, icon, type, targetCount, unit, userId } = body;

    if (!name || name.trim() === '') {
      return c.json({ success: false, error: 'Name is required' }, 400);
    }

    const newHabit = await dbService.createHabit({
      userId: userId || 'default_user',
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#ff1744',
      icon: icon || 'flame',
      type: type === 'count' ? 'count' : 'boolean',
      targetCount: targetCount ? Number(targetCount) : 1,
      unit: unit || 'kali',
    });

    return c.json({ success: true, habit: newHabit }, 201);
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// PATCH /api/habits/:id - Edit / Deactivate habit
habitsRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const updated = await dbService.updateHabit(id, {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.targetCount !== undefined && { targetCount: Number(body.targetCount) }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    });

    if (!updated) {
      return c.json({ success: false, error: 'Habit not found' }, 404);
    }

    return c.json({ success: true, habit: updated });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// DELETE /api/habits/:id - Delete habit
habitsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await dbService.deleteHabit(id);
    return c.json({ success: true, message: 'Habit deleted' });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});
