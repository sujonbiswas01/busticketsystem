export function parseDateForPrisma(dateStr: string) {
  const parsedDate = new Date(dateStr);
  
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format! Use YYYY-MM-DD or ISO string.");
  }

  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);

  return { gte: startOfDay, lte: endOfDay };
}