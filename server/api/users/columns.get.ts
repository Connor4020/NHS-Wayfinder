import pool from '../../../api/database';

export default defineEventHandler(async () => {
  try {
    const [rows] = await pool.query('SHOW COLUMNS FROM navigation_system.users');
    return (rows as any[]).map(r => ({ name: r.Field, type: r.Type, extra: r.Extra }));
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch columns' });
  }
});
