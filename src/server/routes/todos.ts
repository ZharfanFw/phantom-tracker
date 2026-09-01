import { Hono } from 'hono';
import { dbService } from '../db/index.ts';

export const todosRouter = new Hono();

// GET /api/todos - List todos
todosRouter.get('/', async (c) => {
  try {
    const status = c.req.query('status') as 'pending' | 'done' | 'all' | undefined;
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 100;

    const list = await dbService.getTodos(status, limit);
    return c.json({ success: true, todos: list });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// POST /api/todos - Create todo (used by Quickshell popup & web fallback)
todosRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { title, source, userId } = body;

    if (!title || title.trim() === '') {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }

    const newTodo = await dbService.createTodo(
      title.trim(),
      source === 'popup' ? 'popup' : 'web',
      userId || 'default_user'
    );

    return c.json({ success: true, todo: newTodo }, 201);
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// PATCH /api/todos/:id - Toggle done or edit todo
todosRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const updated = await dbService.toggleTodo(id, body.isDone, body.title);
    if (!updated) {
      return c.json({ success: false, error: 'Todo not found' }, 404);
    }

    return c.json({ success: true, todo: updated });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// DELETE /api/todos/:id - Delete todo
todosRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await dbService.deleteTodo(id);
    return c.json({ success: true, message: 'Todo deleted' });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});
