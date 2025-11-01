import bcrypt from 'bcrypt';

export async function hashText({
  text,
  salt = Number(process.env.HASH_SALT) || 10,
}: {
  text: string;
  salt?: number;
}): Promise<string> {
  return await bcrypt.hash(text, salt);
}

export async function compareText({
  text,
  hash,
}: {
  text: string;
  hash: string;
}): Promise<boolean> {
  return bcrypt.compare(text, hash);
}
