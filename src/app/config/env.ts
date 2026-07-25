import dotenv from "dotenv";
import status from "http-status";
import AppError from "../errorHelper/AppError";


dotenv.config();

interface EnvConfig {
  NODE_ENV?: string;
  PORT: string;
  FRONTEND_URL: string;
  BETTER_AUTH_SECRET:string;
  BETTER_AUTH_URL:string;
  Email:string;
  Password:string;
  ACCESS_TOKEN_SECRET:string;
  REFRESH_TOKEN_SECRET:string;
  ACCESS_TOKEN_EXPIRES_IN?:string;
  
  
}

const loadEnvVariables = (): EnvConfig => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "FRONTEND_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "Email",
    "Password",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        status.OK,
        `Server configuration error: The required environment variable "${variable}" is not set. Verify your .env file or deployment environment settings.`,
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    Email: process.env.Email as string,
    Password: process.env.Password as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  };
};

export const envVars = loadEnvVariables();