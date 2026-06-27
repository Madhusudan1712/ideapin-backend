export const validateEnv = (): void => {
  const requiredEnv = ['MONGO_URI', 'SUPABASE_URL'];
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};
