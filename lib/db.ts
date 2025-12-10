import { Pool } from 'pg';

// Check if we're using Vercel Postgres or local PostgreSQL
const isVercelPostgres = process.env.POSTGRES_URL?.includes('neon.tech') ||
                         process.env.POSTGRES_URL?.includes('vercel-storage');

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: isVercelPostgres ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

/**
 * Execute a SQL query with tagged template literal syntax
 * Works like @vercel/postgres sql`` but uses native pg library
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: any[]; rowCount: number }> {
  const pool = getPool();

  // Build parameterized query
  let query = strings[0];
  const params: any[] = [];

  for (let i = 0; i < values.length; i++) {
    params.push(values[i]);
    query += `$${i + 1}${strings[i + 1]}`;
  }

  try {
    const result = await pool.query(query, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Export a namespace to match @vercel/postgres API
export { sql as default };
