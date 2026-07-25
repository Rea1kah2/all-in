import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    /**
     * Alamat backend AI Analysis, sengaja tanpa awalan NEXT_PUBLIC supaya tidak
     * pernah ikut ke bundel klien. Browser memanggil Route Handler di sini, dan
     * Route Handler itu yang meneruskan ke backend.
     */
    ANALYSIS_API_URL: z.string().url().optional(),
    /** Secret bersama antara Route Handler dan backend. Backend menolak tanpa ini. */
    BACKEND_SHARED_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_ENABLE_MOCK_API: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    NEXT_PUBLIC_LIVE_API_PATHS: z
      .string()
      .default("")
      .transform((value) =>
        value
          .split(",")
          .map((path) => path.trim())
          .filter(Boolean),
      ),
    NEXT_PUBLIC_LOCAL_LIVE_PATHS: z
      .string()
      .default("/api/market")
      .transform((value) =>
        value
          .split(",")
          .map((path) => path.trim())
          .filter(Boolean),
      ),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ANALYSIS_API_URL: process.env.ANALYSIS_API_URL,
    BACKEND_SHARED_SECRET: process.env.BACKEND_SHARED_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENABLE_MOCK_API: process.env.NEXT_PUBLIC_ENABLE_MOCK_API,
    NEXT_PUBLIC_LIVE_API_PATHS: process.env.NEXT_PUBLIC_LIVE_API_PATHS,
    NEXT_PUBLIC_LOCAL_LIVE_PATHS: process.env.NEXT_PUBLIC_LOCAL_LIVE_PATHS,
  },
  emptyStringAsUndefined: true,
});
