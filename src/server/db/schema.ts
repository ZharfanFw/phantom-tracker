import { pgTable, text, integer, boolean, timestamp, date, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).default('default_user').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#ff1744').notNull(),
  icon: text('icon').default('flame').notNull(),
  type: text('type').default('boolean').notNull(), // 'boolean' | 'count'
  targetCount: integer('target_count').default(1).notNull(),
  unit: text('unit').default('kali'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const habitCheckins = pgTable('habit_checkins', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitId: uuid('habit_id')
    .references(() => habits.id, { onDelete: 'cascade' })
    .notNull(),
  checkedAt: date('checked_at').notNull(), // Format 'YYYY-MM-DD'
  value: integer('value').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).default('default_user').notNull(),
  title: text('title').notNull(),
  source: text('source').default('web').notNull(), // 'popup' | 'web'
  isDone: boolean('is_done').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  doneAt: timestamp('done_at'),
});

export const habitsRelations = relations(habits, ({ many }) => ({
  checkins: many(habitCheckins),
}));

export const habitCheckinsRelations = relations(habitCheckins, ({ one }) => ({
  habit: one(habits, {
    fields: [habitCheckins.habitId],
    references: [habits.id],
  }),
}));
