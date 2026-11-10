export const dateFormats = ["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const;
export type DateFormat = (typeof dateFormats)[number];

export function formatUserDate(value: string | Date, dateFormat: DateFormat): string {
  const [year, month, day] = typeof value === "string"
    ? value.slice(0, 10).split("-")
    : [String(value.getFullYear()), String(value.getMonth() + 1), String(value.getDate())];
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  if (dateFormat === "YYYY-MM-DD") return `${year}-${paddedMonth}-${paddedDay}`;
  if (dateFormat === "DD/MM/YYYY") return `${paddedDay}/${paddedMonth}/${year}`;
  return `${paddedDay}.${paddedMonth}.${year}`;
}
