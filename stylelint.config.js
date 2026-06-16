export default {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
  rules: {
    // Shadcn/UI generates CSS variables without empty lines between them
    "custom-property-empty-line-before": null,
    // Tailwind v4 / Shadcn uses decimal oklch notation (e.g. oklch(1 0 0)) — not the percentage/degree form
    "lightness-notation": null,
    "hue-degree-notation": null,
    // Prefer traditional min-width syntax over CSS Level 4 range notation
    "media-feature-range-notation": null,
  },
};
