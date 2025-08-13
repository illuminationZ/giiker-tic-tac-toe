import { Prisma } from "@prisma/client";

declare global {
  namespace Prisma {
    interface PrismaClientOptions {
      errorFormat?: "pretty" | "colorless" | "minimal";
    }
  }
}

export {};
