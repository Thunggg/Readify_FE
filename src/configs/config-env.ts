import { z } from "zod";

export const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_AI_ENDPOINT: z.string().optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string(),
});

export const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_AI_ENDPOINT: process.env.NEXT_PUBLIC_AI_ENDPOINT,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
});

if (!configProject.success) {
  console.error(configProject.error.issues);
  throw new Error("Invalid environment variables");
}

const envConfig = configProject.data;

export default envConfig;
