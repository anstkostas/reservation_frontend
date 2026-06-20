import * as z from "zod";

type TranslateFunction = (key: string, options?: Record<string, unknown>) => string;

/**
 * Returns the Zod schema for the owner restaurant edit form with localized messages.
 * All fields are required EXCEPT the Greek description, which may be an empty string
 * (an empty EL input clears/sets no translation). Bounds mirror the backend updateRestaurantSchema.
 *
 * @param {TranslateFunction} t - i18next translate function from `useTranslation()`
 * @returns {ZodObject} Restaurant edit form schema
 */
export function createRestaurantEditSchema(t: TranslateFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(4, t("validatorRestaurantNameTooShort"))
      .max(100, t("validatorRestaurantNameTooLong"))
      .refine((val) => /\p{L}/u.test(val), t("validatorRestaurantNameNoLetter"))
      .refine(
        (val) => !/[^\p{L}\p{N}\s]{2,}/u.test(val),
        t("validatorRestaurantNameConsecutiveSpecial"),
      ),
    descriptionEn: z
      .string()
      .trim()
      .min(1, t("validatorRestaurantDescriptionEnRequired"))
      .max(500, t("validatorRestaurantDescriptionTooLong"))
      .refine(
        (val) => !/[Ͱ-Ͽἀ-῿]/.test(val),
        t("validatorRestaurantDescriptionEnLatinOnly"),
      )
      .refine(
        (val) => /\p{Script=Latin}/u.test(val),
        t("validatorRestaurantDescriptionEnNoLetter"),
      ),
    descriptionEl: z
      .string()
      .trim()
      .max(500, t("validatorRestaurantDescriptionTooLong"))
      .refine(
        (val) => val === "" || !/[a-zA-Z]/.test(val),
        t("validatorRestaurantDescriptionElGreekOnly"),
      )
      .refine(
        (val) => val === "" || /\p{Script=Greek}/u.test(val),
        t("validatorRestaurantDescriptionElNoLetter"),
      ),
    address: z
      .string()
      .trim()
      .min(1, t("validatorRestaurantAddressRequired"))
      .max(255, t("validatorRestaurantAddressTooLong"))
      .refine((val) => /\p{L}/u.test(val), t("validatorRestaurantAddressNoLetter")),
    phone: z
      .string()
      .trim()
      .min(1, t("validatorRestaurantPhoneRequired"))
      .refine((val) => /^\d+$/.test(val), t("validatorRestaurantPhoneDigitsOnly"))
      .refine((val) => val.length >= 7, t("validatorRestaurantPhoneTooShort"))
      .refine((val) => val.length <= 15, t("validatorRestaurantPhoneTooLong")),
    capacity: z
      .number({ error: t("validatorRestaurantCapacityInvalid") })
      .int(t("validatorRestaurantCapacityInteger"))
      .min(1, t("validatorRestaurantCapacityTooLow")),
  });
}

export type RestaurantEditFormValues = z.infer<ReturnType<typeof createRestaurantEditSchema>>;
