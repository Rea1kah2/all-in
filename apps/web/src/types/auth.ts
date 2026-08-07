import { z } from "zod";

export const riskProfileSchema = z.enum(["conservative", "moderate", "aggressive"]);
export const investmentGoalSchema = z.enum(["short_term", "medium_term", "long_term"]);

export const userSchema = z.object({
  // better-auth memakai id string (nanoid), bukan angka bersambung.
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  /** URL foto profil di Vercel Blob. Kosong berarti dipakai avatar inisial. */
  image: z.string().nullable(),
  createdAt: z.string(),
  notifyPriceAlert: z.boolean(),
  notifyNewsDigest: z.boolean(),
  defaultRiskProfile: riskProfileSchema,
  defaultInvestmentGoal: investmentGoalSchema,
});

export type User = z.infer<typeof userSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["password_confirmation"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
