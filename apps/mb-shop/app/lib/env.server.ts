function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

export function getWooSecretParam() {
  return required("WOO_SECRET_PARAM");
}

export function getSessionSecret() {
  return required("SESSION_SECRET");
}
