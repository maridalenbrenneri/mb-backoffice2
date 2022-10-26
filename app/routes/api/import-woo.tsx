import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({
  request,
}) => {
  switch (request.method) {
    case "GET": {
      return json({ success: true, data: "hello resource route" }, 200);
    }
    case "POST": {
      /* handle "POST" */
    }
    default: 
      return json({ message: "Method not allowed" }, 405);
  }
};
