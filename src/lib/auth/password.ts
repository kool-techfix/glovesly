import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// A real hash at the same cost, created once per process, so a login for an
// unknown email (or an account without a password) takes as long as a real one.
let dummyHash: Promise<string> | null = null;

/** Runs a full bcrypt compare that always fails. Use to equalise login timing. */
export async function verifyAgainstDummy(plain: string): Promise<false> {
  dummyHash ??= bcrypt.hash("glovesly-timing-equaliser", BCRYPT_ROUNDS);
  await bcrypt.compare(plain, await dummyHash);
  return false;
}
