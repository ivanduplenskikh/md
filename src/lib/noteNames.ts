/** Characters Windows and POSIX both reject in file names. */
export function sanitizeName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "-").trim() || "Untitled";
}

/** Appends a counter until `taken` reports the name is free. */
export async function uniqueNotePath(
  name: string,
  taken: (path: string) => boolean | Promise<boolean>,
) {
  let path = `${name}.md`;
  let n = 1;
  while (await taken(path)) path = `${name} ${++n}.md`;
  return path;
}
