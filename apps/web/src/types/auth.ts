import { z } from "zod";

export const userSchema = z.object({
  // better-auth memakai id string (nanoid), bukan angka bersambung.
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  notifyPriceAlert: z.boolean(),
  notifyNewsDigest: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

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
