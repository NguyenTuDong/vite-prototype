export function openInEditor(file: string) {
  fetch("/__open-in-editor?file=" + encodeURIComponent(file || ""));
}
