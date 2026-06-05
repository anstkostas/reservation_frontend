import * as z from "zod";
import type { TFunction } from "i18next";

/**
 * Returns the Zod schema for the login form with localized validation messages.
 *
 * @param {TFunction} t - i18next translate function from `useTranslation()`
 * @returns {ZodObject} Login form schema
 */
export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().min(1, t("validatorEmailRequired")).email({ error: t("validatorEmailInvalid") }),
    password: z.string().min(1, t("validatorPasswordRequired")),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Returns the Zod schema for the signup form with localized validation messages.
 * Includes cross-field password confirmation check via `.refine()`.
 *
 * @param {TFunction} t - i18next translate function from `useTranslation()`
 * @returns {ZodEffects} Signup form schema
 */
export function createSignupSchema(t: TFunction) {
  return z
    .object({
      firstname: z.string().min(2, t("validatorNameTooShort")),
      lastname: z.string().min(2, t("validatorNameTooShort")),
      email: z.string().min(1, t("validatorEmailRequired")).email({ error: t("validatorEmailInvalid") }),
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
          t("validatorPasswordComplexity")
        ),
      confirmPassword: z.string(),
      isOwner: z.boolean(),
      restaurantId: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validatorPasswordsMustMatch"),
      path: ["confirmPassword"],
    });
}

export type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>;
