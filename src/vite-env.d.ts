// Pulls in Vite's built-in TypeScript declarations, which do two things:
// 1. Types import.meta.env — without this, tsc doesn't know VITE_API_URL exists and errors on it.
// 2. Types Vite-specific globals like import.meta.hot (used by HMR).
// Required in every Vite + TypeScript project. Must live in src/ so tsc picks it up.
/// <reference types="vite/client" />
