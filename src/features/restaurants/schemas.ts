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
      .max(100, t("validatorRestaurantNameTooLong")),
    descriptionEn: z
      .string()
      .trim()
      .min(1, t("validatorRestaurantDescriptionEnRequired"))
      .max(500, t("validatorRestaurantDescriptionTooLong")),
    descriptionEl: z
      .string()
      .trim()
      .max(500, t("validatorRestaurantDescriptionTooLong")), // optional: "" is valid
    address: z
      .string()
      .trim()
      .min(1, t("validatorRestaurantAddressRequired"))
      .max(255, t("validatorRestaurantAddressTooLong")),
    phone: z
      .string()
      .trim()
      .min(1, t("validatorRestaurantPhoneRequired"))
      .max(30, t("validatorRestaurantPhoneTooLong")),
    capacity: z
      .number({ error: t("validatorRestaurantCapacityInvalid") })
      .int(t("validatorRestaurantCapacityInteger"))
      .min(1, t("validatorRestaurantCapacityTooLow")),
  });
}

export type RestaurantEditFormValues = z.infer<ReturnType<typeof createRestaurantEditSchema>>;
