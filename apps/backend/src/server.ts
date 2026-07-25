import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { allowedOrigins, env } from "./lib/env.ts";
import { analyzeRouter } from "./routes/analyze.ts";
import { healthRouter } from "./routes/health.ts";

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "16kb" }));
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    maxAge: 86_400,
  }),
);

// Tiap panggilan ke bawah sini berbiaya, jadi hanya Route Handler Next.js yang
// memegang secret ini boleh masuk. CORS tidak menolong di sini, CORS hanya
// mengatur browser dan tidak menghalangi curl.
if (env.BACKEND_SHARED_SECRET) {
  app.use("/api", (request, response, next) => {
    if (request.get("x-backend-secret") === env.BACKEND_SHARED_SECRET) {
      next();
      return;
    }
    response.status(401).json({ message: "Tidak diizinkan", code: "unauthorized" });
  });
} else {
  console.warn(
    "BACKEND_SHARED_SECRET kosong, /api terbuka untuk siapa pun. Isi sebelum deploy.",
  );
}

app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: env.RATE_LIMIT_PER_MINUTE,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      message: "Terlalu banyak permintaan, tunggu sebentar sebelum mencoba lagi",
      code: "rate_limited",
    },
  }),
);

app.use(healthRouter);
app.use(analyzeRouter);

app.use((_request, response) => {
  response.status(404).json({ message: "Endpoint tidak ditemukan", code: "not_found" });
});

app.listen(env.PORT, () => {
  console.warn(`all-in-backend siap di http://localhost:${env.PORT}`);
  console.warn(`Origin yang diizinkan: ${allowedOrigins.join(", ")}`);
  console.warn(`Model Gemini: ${env.GEMINI_MODEL}`);
});
