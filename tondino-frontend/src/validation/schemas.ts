import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'ایمیل الزامی است')
    .email('فرمت ایمیل صحیح نیست'),
  password: z
    .string()
    .min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد')
    .max(100, 'رمز عبور نباید بیشتر از 100 کاراکتر باشد')
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register validation schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نباید بیشتر از 50 کاراکتر باشد'),
  email: z
    .string()
    .min(1, 'ایمیل الزامی است')
    .email('فرمت ایمیل صحیح نیست'),
  password: z
    .string()
    .min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد')
    .max(100, 'رمز عبور نباید بیشتر از 100 کاراکتر باشد')
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نباید بیشتر از 50 کاراکتر باشد'),
  avatar: z.string().url('آدرس تصویر معتبر نیست').optional()
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Contact form validation schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نباید بیشتر از 50 کاراکتر باشد'),
  email: z
    .string()
    .min(1, 'ایمیل الزامی است')
    .email('فرمت ایمیل صحیح نیست'),
  subject: z
    .string()
    .min(3, 'موضوع باید حداقل 3 کاراکتر باشد')
    .max(100, 'موضوع نباید بیشتر از 100 کاراکتر باشد'),
  message: z
    .string()
    .min(10, 'پیام باید حداقل 10 کاراکتر باشد')
    .max(1000, 'پیام نباید بیشتر از 1000 کاراکتر باشد')
});

export type ContactFormData = z.infer<typeof contactSchema>;
