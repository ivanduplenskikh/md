/**
 * Display-only helpers. Vault I/O uses the async `@tauri-apps/api/path` functions;
 * these exist because React rendering needs the values synchronously.
 */
export function basename(path: string) {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

export function stripExtension(path: string) {
  return path.replace(/\.md$/i, "");
}
