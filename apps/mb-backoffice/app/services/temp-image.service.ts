import { randomUUID } from 'crypto';
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

export const TMP_UPLOAD_DIR = path.join(tmpdir(), 'mb-backoffice-uploads');

const MAX_BYTES = 8 * 1024 * 1024;
const STALE_AFTER_MS = 60 * 60 * 1000;

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const SAFE_FILENAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif)$/i;

export function isSafeTempImageFilename(filename: string) {
  return SAFE_FILENAME_RE.test(filename);
}

export function contentTypeForFilename(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return EXT_TO_MIME[ext] || 'application/octet-stream';
}

export function isUploadedImage(value: unknown): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as File).arrayBuffer === 'function' &&
    typeof (value as File).size === 'number' &&
    typeof (value as File).type === 'string'
  );
}

export async function saveTempPublicImage(file: File) {
  if (!isUploadedImage(file) || file.size === 0) {
    return { kind: 'error' as const, error: 'Select an image to upload' };
  }

  if (file.size > MAX_BYTES) {
    return { kind: 'error' as const, error: 'Image is too large (max 8 MB)' };
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return {
      kind: 'error' as const,
      error: 'Image must be JPEG, PNG, WebP or GIF',
    };
  }

  await mkdir(TMP_UPLOAD_DIR, { recursive: true });
  await deleteStaleTempImages();

  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(TMP_UPLOAD_DIR, filename);
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

  return { kind: 'success' as const, filename };
}

export async function deleteTempPublicImage(filename: string) {
  if (!isSafeTempImageFilename(filename)) return;

  try {
    await unlink(path.join(TMP_UPLOAD_DIR, filename));
  } catch (err) {
    console.warn('Failed to delete temp image', filename, err);
  }
}

export async function readTempPublicImage(filename: string) {
  if (!isSafeTempImageFilename(filename)) return null;

  try {
    return await readFile(path.join(TMP_UPLOAD_DIR, filename));
  } catch {
    return null;
  }
}

async function deleteStaleTempImages() {
  let entries: string[] = [];
  try {
    entries = await readdir(TMP_UPLOAD_DIR);
  } catch {
    return;
  }

  const cutoff = Date.now() - STALE_AFTER_MS;

  await Promise.all(
    entries.map(async (filename) => {
      if (!isSafeTempImageFilename(filename)) return;

      const filepath = path.join(TMP_UPLOAD_DIR, filename);
      try {
        const fileStat = await stat(filepath);
        if (fileStat.mtimeMs < cutoff) {
          await unlink(filepath);
        }
      } catch {
        // Ignore files that disappear while cleaning up
      }
    })
  );
}
