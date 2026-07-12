import { createHash } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha512").update(password).digest("hex");
}

export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash;
}
