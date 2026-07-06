import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import {
  deleteTempImageByUrl,
  saveTempImage,
} from '~/_libs/temp-uploads';
import { requireUserId } from '~/utils/session.server';

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);

  if (request.method === 'DELETE') {
    const url = new URL(request.url).searchParams.get('url');
    if (url) {
      await deleteTempImageByUrl(url);
    }
    return json({ ok: true });
  }

  const formData = await request.formData();
  const file = formData.get('image');

  if (!file || !(file instanceof File)) {
    return json({ error: 'No image file provided' }, { status: 400 });
  }

  try {
    const { url } = await saveTempImage(file);
    return json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return json({ error: message }, { status: 400 });
  }
};
