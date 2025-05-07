import { getDataSource } from './db';

// Initialize database connection when server starts
const initializeDatabase = async () => {
  try {
    console.log('Initializing database connection...');
    const dataSource = await getDataSource();
    console.log('Database connected and initialized successfully!');
    return dataSource;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1); // Exit if database connection fails
  }
};

// Start initialization
console.log('Starting database initialization...');
initializeDatabase();

export default initializeDatabase;