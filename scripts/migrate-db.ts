import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Set WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Migration started...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  // Create tables directly
  try {
    // Drop enum types if they exist (to avoid conflicts)
    await pool.query('DROP TYPE IF EXISTS user_role, user_status, survey_status, question_type, redemption_status, redemption_type CASCADE');
    
    // Create enum types
    await pool.query(`CREATE TYPE user_role AS ENUM ('doctor', 'representative', 'client', 'admin')`);
    await pool.query(`CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive', 'suspended')`);
    await pool.query(`CREATE TYPE survey_status AS ENUM ('draft', 'active', 'inactive', 'completed')`);
    await pool.query(`CREATE TYPE question_type AS ENUM ('text', 'likert', 'multipleChoice', 'checkbox', 'ranking', 'matrix')`);
    await pool.query(`CREATE TYPE redemption_status AS ENUM ('pending', 'processing', 'completed', 'rejected')`);
    await pool.query(`CREATE TYPE redemption_type AS ENUM ('upi', 'amazon')`);
    
    // Create all tables
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role user_role NOT NULL,
        status user_status NOT NULL DEFAULT 'active',
        profile_picture TEXT,
        activation_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        specialty VARCHAR(255),
        hospital VARCHAR(255),
        bio TEXT,
        total_points INTEGER NOT NULL DEFAULT 0,
        redeemed_points INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        company_name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        contact_person VARCHAR(255),
        contact_phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS representatives (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        client_id INTEGER NOT NULL REFERENCES clients(id),
        region VARCHAR(255),
        territory VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        points INTEGER NOT NULL,
        estimated_time INTEGER NOT NULL,
        status survey_status NOT NULL DEFAULT 'draft',
        starts_at TIMESTAMP,
        ends_at TIMESTAMP,
        target_specialty VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS survey_questions (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER NOT NULL REFERENCES surveys(id),
        question_text TEXT NOT NULL,
        question_type question_type NOT NULL,
        options JSONB,
        required BOOLEAN NOT NULL DEFAULT false,
        order_index INTEGER NOT NULL,
        conditional_logic JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS doctor_survey_responses (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id),
        survey_id INTEGER NOT NULL REFERENCES surveys(id),
        completed BOOLEAN NOT NULL DEFAULT false,
        points_earned INTEGER NOT NULL DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS question_responses (
        id SERIAL PRIMARY KEY,
        doctor_survey_response_id INTEGER NOT NULL REFERENCES doctor_survey_responses(id),
        question_id INTEGER NOT NULL REFERENCES survey_questions(id),
        response_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS redemptions (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id),
        points INTEGER NOT NULL,
        redemption_type redemption_type NOT NULL,
        redemption_details JSONB,
        status redemption_status NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS doctor_client_mappings (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id),
        client_id INTEGER NOT NULL REFERENCES clients(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS doctor_rep_mappings (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id),
        rep_id INTEGER NOT NULL REFERENCES representatives(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `));
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  await pool.end();
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
