import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { upsertCoffee } from "~/_libs/core/models/coffee.server";

type ActionData =
  | {
      name: null | string;
      productCode: null | string;
      country: null | string;
    }
  | undefined;

export const upsertAction = async (request: any) => {
  const formData = await request.formData();

  const id = +formData.get("id");
  const name = formData.get("name");
  const productCode = formData.get("productCode");
  const country = formData.get("country");

  console.log("Form", id);
  console.log("Form", name);
  console.log("Form", productCode);
  console.log("Form", country);

  const errors: ActionData = {
    name: name ? null : "Name is required",
    productCode: productCode ? null : "Product code is required",
    country: country ? null : "Country is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    console.debug("Errors in form", errors);
    return json<ActionData>(errors);
  }

  invariant(typeof name === "string", "name must be a string");
  invariant(typeof productCode === "string", "productCode must be a string");
  invariant(typeof country === "string", "country must be a string");

  const data = {
    name,
    productCode,
    country,
    status: "active",
  };

  await upsertCoffee({ ...data, id });

  return redirect("/coffees");
};
