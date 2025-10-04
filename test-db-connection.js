/**
 * Test PostgreSQL Connection
 * Verifies Replit PostgreSQL is working
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');

  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Get server info
    const result = await client.query('SELECT NOW() as time, version() as version');
    const row = result.rows[0];
    
    console.log('\n📊 Database Info:');
    console.log('   Time:', row.time);
    console.log('   PostgreSQL:', row.version.split(' ')[1]);
    
    // Get database name
    const dbInfo = await client.query('SELECT current_database()');
    console.log('   Database:', dbInfo.rows[0].current_database);
    
    // Check if our tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables in database:');
    if (tables.rows.length === 0) {
      console.log('   ⚠️  No tables found - run migrations!');
      console.log('   Run: npm run db:generate && npm run db:migrate');
    } else {
      tables.rows.forEach(row => {
        console.log('   ✅', row.table_name);
      });
      console.log(`\n   Total: ${tables.rows.length} tables`);
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✨ Connection test complete!\n');
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('   Error:', error.message);
    
    if (error.message.includes('password')) {
      console.error('\n💡 Tip: Check DATABASE_URL in Replit Secrets');
      console.error('   1. Click "Tools" → "PostgreSQL"');
      console.error('   2. Regenerate database if needed');
    }
    
    if (error.message.includes('SSL')) {
      console.error('\n💡 Tip: Add SSL config to database connection');
    }
    
    process.exit(1);
  }
}

testConnection();
