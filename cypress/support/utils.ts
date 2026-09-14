
export function getAuthCodeFromLocation(location: string | string[]): string | undefined {
  const locationStr = Array.isArray(location) ? location[0] : location;

  const url = new URL(locationStr);
  const params = url.search.substring(1).split("&");
  for (const param of params) {
    const [key, value] = param.split("=");
    if (key === "code") {
      return value;
    }
  }
  return undefined;
}
