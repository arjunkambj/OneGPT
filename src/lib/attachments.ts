import type { FileUIPart } from "ai";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB
export const ACCEPTED_TYPES = "image/*";

const ACCEPTED_MIME_PREFIXES = ["image/"];

function isAcceptedMimeType(type: string) {
  return ACCEPTED_MIME_PREFIXES.some(
    (prefix) => type === prefix || type.startsWith(prefix),
  );
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!isAcceptedMimeType(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || "unknown"}`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File "${file.name}" exceeds 10MB limit` };
  }
  return { valid: true };
}

export function validateFiles(
  files: File[],
  existing: FileUIPart[],
): { valid: File[]; errors: string[] } {
  const errors: string[] = [];
  const valid: File[] = [];

  // Estimate existing total size from data URLs
  let totalSize = existing.reduce(
    (sum, f) => sum + Math.ceil((f.url.length * 3) / 4),
    0,
  );

  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      if (result.error) errors.push(result.error);
      continue;
    }
    if (totalSize + file.size > MAX_TOTAL_SIZE) {
      errors.push("Total attachment size exceeds 20MB limit");
      break;
    }
    totalSize += file.size;
    valid.push(file);
  }

  return { valid, errors };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function filesToFileUIParts(files: File[]): Promise<FileUIPart[]> {
  return Promise.all(
    files.map(async (file) => {
      const url = await fileToDataUrl(file);
      return {
        type: "file" as const,
        mediaType: file.type || "application/octet-stream",
        url,
        filename: file.name,
      };
    }),
  );
}
