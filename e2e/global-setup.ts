import { execSync } from "node:child_process";
import * as path from "node:path";

// Resets the test database to a clean, seeded state before every suite run.
// Prevents accumulated bookings from previous runs triggering the 4-hour
// per-customer conflict buffer and failing subsequent booking tests.
export default async function globalSetup(): Promise<void> {
  const backendDir = path.resolve(process.cwd(), "../reservation_backend");
  // migrate reset drops and recreates the schema but does not auto-seed in Prisma v7
  // with prisma.config.ts — run the seed explicitly after the reset
  execSync("NODE_ENV=test npx prisma migrate reset --force", {
    cwd: backendDir,
    stdio: "inherit",
  });
  execSync("NODE_ENV=test npx prisma db seed", {
    cwd: backendDir,
    stdio: "inherit",
  });
}
