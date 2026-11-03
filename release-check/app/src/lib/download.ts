/** Hand a piece of text to the browser as a file. The robot wrote the text;
 * this only turns it into something the person can save. */
export function downloadText(filename: string, text: string, type: string): void {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** A file name from a build somebody typed, with nothing a file system minds. */
export function safeName(build: string): string {
  return (build || "run").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "run";
}
