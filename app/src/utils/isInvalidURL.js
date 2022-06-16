/** Ensures it is both a valid URL and a valid HTTP protocol based URL */
export default function isInvalidURL(string) {
  try {
    const url = new URL(string);
    return !(url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return true;
  }
}
