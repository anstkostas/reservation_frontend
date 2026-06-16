/**
 * Unit tests for createRestaurantEditSchema — name, description EN/EL, address, phone, capacity.
 * Type: unit (pure Zod validation via .safeParse()).
 *
 * Covers: passes for full valid object; passes when EL description is empty string;
 *   fails name < 4 chars; fails EN description empty; fails EN description > 500 chars;
 *   fails address empty; fails phone empty; fails capacity 0 (too low); fails capacity 2.5 (not int);
 *   fails capacity NaN (invalid number).
 * Oracle: spec §2.4 field bounds (mirror backend updateRestaurantSchema) + §2.9 i18n key names.
 */

import { z } from "zod";
import { createRestaurantEditSchema } from "@/features/restaurants/schemas";

// Minimal mock — returns English strings for each key used in the schema
const t = (key: string): string => {
  const translations: Record<string, string> = {
    validatorRestaurantNameTooShort: "Name must be at least 4 characters",
    validatorRestaurantNameTooLong: "Name must be at most 100 characters",
    validatorRestaurantDescriptionEnRequired: "An English description is required",
    validatorRestaurantDescriptionTooLong: "Description must be at most 500 characters",
    validatorRestaurantAddressRequired: "Address is required",
    validatorRestaurantAddressTooLong: "Address must be at most 255 characters",
    validatorRestaurantPhoneRequired: "Phone is required",
    validatorRestaurantPhoneTooLong: "Phone must be at most 30 characters",
    validatorRestaurantCapacityInvalid: "Enter a valid number",
    validatorRestaurantCapacityInteger: "Capacity must be a whole number",
    validatorRestaurantCapacityTooLow: "Capacity must be at least 1",
  };
  return translations[key] ?? key;
};

const schema = createRestaurantEditSchema(t);

const valid = {
  name: "Valid Name",
  descriptionEn: "An English description",
  descriptionEl: "Μια ελληνική περιγραφή",
  address: "1 Test Street",
  phone: "2100000000",
  capacity: 10,
};

describe("restaurant edit form schema", () => {
  it("passes for a full valid object", () => {
    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("passes when descriptionEl is an empty string", () => {
    const result = schema.safeParse({ ...valid, descriptionEl: "" });
    expect(result.success).toBe(true);
  });

  it("fails when name is shorter than 4 characters", () => {
    const result = schema.safeParse({ ...valid, name: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.name).toContain(
        "Name must be at least 4 characters"
      );
    }
  });

  it("fails when descriptionEn is empty", () => {
    const result = schema.safeParse({ ...valid, descriptionEn: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.descriptionEn).toContain(
        "An English description is required"
      );
    }
  });

  it("fails when descriptionEn exceeds 500 characters", () => {
    const result = schema.safeParse({ ...valid, descriptionEn: "a".repeat(501) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.descriptionEn).toContain(
        "Description must be at most 500 characters"
      );
    }
  });

  it("fails when address is empty", () => {
    const result = schema.safeParse({ ...valid, address: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.address).toContain(
        "Address is required"
      );
    }
  });

  it("fails when phone is empty", () => {
    const result = schema.safeParse({ ...valid, phone: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.phone).toContain(
        "Phone is required"
      );
    }
  });

  it("fails when capacity is 0 (below minimum)", () => {
    const result = schema.safeParse({ ...valid, capacity: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.capacity).toContain(
        "Capacity must be at least 1"
      );
    }
  });

  it("fails when capacity is a non-integer (2.5)", () => {
    const result = schema.safeParse({ ...valid, capacity: 2.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.capacity).toContain(
        "Capacity must be a whole number"
      );
    }
  });

  it("fails when capacity is NaN", () => {
    const result = schema.safeParse({ ...valid, capacity: NaN });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.capacity).toContain(
        "Enter a valid number"
      );
    }
  });
});
