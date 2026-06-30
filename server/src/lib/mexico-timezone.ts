export function getMexicoDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
}

export function getLocalDateString(): string {
  const d = getMexicoDate();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getMexicoDayRange(dateStr?: string): { from: Date; to: Date } {
  const d = dateStr ? new Date(dateStr + "T00:00:00-06:00") : getMexicoDate();
  const from = new Date(d);
  from.setHours(0, 0, 0, 0);
  const to = new Date(d);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}
