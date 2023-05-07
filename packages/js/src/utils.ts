export function serializeBody(body: unknown) {
  try {
    return JSON.stringify(body);
  } catch {
    return null;
  }
}
