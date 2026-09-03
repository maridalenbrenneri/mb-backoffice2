import type { LoaderFunction } from '@remix-run/node';
import {
  contentTypeForFilename,
  readTempPublicImage,
} from '~/services/temp-image.service';

export const loader: LoaderFunction = async ({ params }) => {
  const filename = params.filename;
  if (!filename) {
    throw new Response('Not found', { status: 404 });
  }

  const data = await readTempPublicImage(filename);
  if (!data) {
    throw new Response('Not found', { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': contentTypeForFilename(filename),
      'Cache-Control': 'no-store',
    },
  });
};
