import { getCustomers } from "~/_libs/fiken";

export async function getB2BCustomers() {
  return await getCustomers();
}
