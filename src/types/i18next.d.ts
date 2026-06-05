export {};

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    strictKeyChecks: true;
    resources: {
      translation: import("../locales/en.json");
    };
  }
}
