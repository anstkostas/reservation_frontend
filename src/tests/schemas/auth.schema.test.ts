import { z } from "zod";
import type { TFunction } from "i18next";
import { createLoginSchema, createSignupSchema } from "@/features/auth/schemas";

/**
 * Unit tests for the auth form schemas (createLoginSchema, createSignupSchema).
 * Type: unit (pure Zod validation via .safeParse(), no DOM, no mocks).
 *
 * Covers:
 *   createLoginSchema — valid login passes; empty email → required key; malformed email → invalid key;
 *     empty password → required key.
 *   createSignupSchema — valid signup passes; firstname/lastname below 2 chars → too-short key;
 *     empty email → required key; malformed email → invalid key; password complexity failures
 *     (too short, missing upper / lower / digit / special) → complexity key; password/confirm
 *     mismatch → must-match key on confirmPassword.
 * Not yet covered: name longer than 50 (backend userValidation.ts enforces max(50); frontend schema
 *   does not — left untested by decision); owner without restaurantId (backend .refine requires it for
 *   owners; frontend signup schema does not — left untested by decision); whitespace trimming on
 *   names/email (frontend does not trim; backend does); the `restaurantId` optional field accepting a
 *   real UUID.
 * Possible expansions: locale-specific email edge cases; password special-character coverage beyond
 *   a single representative symbol.
 *
 * Oracle: password complexity regex and the firstname/lastname min(2) bound are confirmed against the
 *   shared backend signup contract (reservation_backend/src/validation/userValidation.ts); DOMAIN.md is
 *   silent on both. Message assertions are anchored to the i18n keys the schema wires to each field —
 *   the `t` mock returns the key verbatim, so a passing assertion proves the correct key reaches the
 *   correct field, not the source's own literal.
 */

// Minimal i18n mock — returns the key verbatim so assertions check key-to-field wiring.
const t = ((key: string): string => key) as unknown as TFunction;

describe("login form schema", () => {
  const loginSchema = createLoginSchema(t);

  it("passes for a well-formed email and non-empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });

    expect(result.success).toBe(true);
  });

  it("fails when email is empty", () => {
    const result = loginSchema.safeParse({ email: "", password: "anything" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.email).toContain("validatorEmailRequired");
    }
  });

  it("fails when email is malformed", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "anything" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.email).toContain("validatorEmailInvalid");
    }
  });

  it("fails when password is empty", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.password).toContain(
        "validatorPasswordRequired"
      );
    }
  });
});

describe("signup form schema", () => {
  const signupSchema = createSignupSchema(t);

  // A fully valid signup payload — individual tests override one field to isolate a rule.
  const validSignup = {
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "Password1!",
    confirmPassword: "Password1!",
    isOwner: false,
  };

  it("passes for a fully valid signup payload", () => {
    const result = signupSchema.safeParse(validSignup);

    expect(result.success).toBe(true);
  });

  it("fails when firstname is shorter than 2 characters", () => {
    const result = signupSchema.safeParse({ ...validSignup, firstname: "J" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.firstname).toContain("validatorNameTooShort");
    }
  });

  it("fails when lastname is shorter than 2 characters", () => {
    const result = signupSchema.safeParse({ ...validSignup, lastname: "D" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.lastname).toContain("validatorNameTooShort");
    }
  });

  it("fails when email is empty", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.email).toContain("validatorEmailRequired");
    }
  });

  it("fails when email is malformed", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "john@" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.email).toContain("validatorEmailInvalid");
    }
  });

  // Password complexity: ≥8 chars AND at least one lowercase, uppercase, digit, and special character.
  // Bound confirmed against the shared backend contract (userValidation.ts passwordPattern — identical regex).
  it.each([
    ["too short (under 8 chars)", "Pass1!"],
    ["missing an uppercase letter", "password1!"],
    ["missing a lowercase letter", "PASSWORD1!"],
    ["missing a digit", "Password!"],
    ["missing a special character", "Password1"],
  ])("fails when the password is %s", (_label, password) => {
    const result = signupSchema.safeParse({ ...validSignup, password, confirmPassword: password });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.password).toContain(
        "validatorPasswordComplexity"
      );
    }
  });

  it("fails when confirmPassword does not match password", () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: "Password1!",
      confirmPassword: "Different1!",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.confirmPassword).toContain(
        "validatorPasswordsMustMatch"
      );
    }
  });
});
