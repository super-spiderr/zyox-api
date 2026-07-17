const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET_KEY",
  "JWT_REFRESH_SECRET_KEY",
] as const;

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
};

export const getAllowedOrigins = (): string[] | true => {
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (!raw) return true;
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
};
