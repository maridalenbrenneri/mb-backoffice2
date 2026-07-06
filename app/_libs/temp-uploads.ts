import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const TEMP_UPLOADS_DIR = path.join(process.cwd(), 'public', 'temp-uploads');
const TEMP_UPLOADS_PATH_PREFIX = '/temp-uploads/';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export function getAppPublicUrl(): string {
  const url = process.env.APP_PUBLIC_URL || 'https://mb-backoffice.fly.dev';
  return url.replace(/\/$/, '');
}

export async function ensureTempUploadsDir(): Promise<void> {
  await fs.mkdir(TEMP_UPLOADS_DIR, { recursive: true });
}

export function buildTempImageUrl(filename: string): string {
  return `${getAppPublicUrl()}${TEMP_UPLOADS_PATH_PREFIX}${filename}`;
}

export function isTempImageUrl(url: string): boolean {
  const prefix = `${getAppPublicUrl()}${TEMP_UPLOADS_PATH_PREFIX}`;
  return url.startsWith(prefix);
}

export function filenameFromTempImageUrl(url: string): string | null {
  if (!isTempImageUrl(url)) return null;
  const prefix = `${getAppPublicUrl()}${TEMP_UPLOADS_PATH_PREFIX}`;
  const filename = url.slice(prefix.length);
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(filename)) return null;
  return filename;
}

export async function saveTempImage(
  file: File
): Promise<{ url: string; filename: string }> {
  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File too large. Maximum size is 5 MB');
  }

  await ensureTempUploadsDir();

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(TEMP_UPLOADS_DIR, filename), buffer);

  return { filename, url: buildTempImageUrl(filename) };
}

export async function deleteTempImageByUrl(url: string): Promise<void> {
  const filename = filenameFromTempImageUrl(url);
  if (!filename) return;

  const filePath = path.join(TEMP_UPLOADS_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Failed to delete temp image ${filename}:`, err);
    }
  }
}
