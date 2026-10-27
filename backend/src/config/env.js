import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file into process.env quietly
dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce
    .number()
    .int()
    .min(1, 'PORT must be between 1 and 65535')
    .max(65535, 'PORT must be between 1 and 65535')
    .default(5000),
  CORS_ORIGIN: z
    .string()
    .trim()
    .min(1, 'CORS_ORIGIN is required')
    .default('http://localhost:5173'),

  // Database configuration
  DB_HOST: z.string().trim().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3306),
  DB_USER: z.string().trim().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string({
    error: 'DB_PASSWORD is required (use an empty string "" only if local MySQL has no password)',
  }),
  DB_NAME: z.string().trim().min(1, 'DB_NAME is required'),
  DB_CONNECTION_LIMIT: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  // JWT and password hashing configuration
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long for cryptographic security'),
  JWT_EXPIRES_IN: z
    .string()
    .trim()
    .min(1, 'JWT_EXPIRES_IN is required (e.g., "1h", "15m")')
    .default('1h'),
  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int()
    .min(10, 'BCRYPT_SALT_ROUNDS must be at least 10')
    .max(16, 'BCRYPT_SALT_ROUNDS should not exceed 16 to avoid excessive CPU blocking')
    .default(12),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[Configuration Error] Invalid or missing environment variables:');
  for (const issue of parsedEnv.error.issues) {
    // Log only the variable path and validation message — never log secret values
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = Object.freeze(parsedEnv.data);

