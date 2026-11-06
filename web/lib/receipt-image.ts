export const MAX_RECEIPT_IMAGE_MB = 15;
const MAX_RECEIPT_IMAGE_BYTES = MAX_RECEIPT_IMAGE_MB * 1024 * 1024;

export type ReceiptImageError = "emptyFile" | "fileTooLarge" | "invalidFile";

export async function validateReceiptImage(file: File): Promise<ReceiptImageError | null> {
  if (file.size === 0) return "emptyFile";
  if (file.size > MAX_RECEIPT_IMAGE_BYTES) return "fileTooLarge";

  const extension = file.name.split(".").pop()?.toLowerCase();
  const bytes = new Uint8Array(await file.slice(0, 40).arrayBuffer());
  const label = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));

  if (extension === "jpg" || extension === "jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? null : "invalidFile";
  }
  if (extension === "png") {
    return bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index])
      ? null : "invalidFile";
  }
  if (extension === "webp") {
    return label(0, 4) === "RIFF" && label(8, 12) === "WEBP" ? null : "invalidFile";
  }
  if (extension === "heic" || extension === "heif") {
    const brands = ["heic", "heix", "hevc", "hevx", "heim", "heis"];
    if (label(4, 8) !== "ftyp") return "invalidFile";
    for (let offset = 8; offset + 4 <= bytes.length; offset += 4) {
      if (brands.includes(label(offset, offset + 4))) return null;
    }
  }
  return "invalidFile";
}
