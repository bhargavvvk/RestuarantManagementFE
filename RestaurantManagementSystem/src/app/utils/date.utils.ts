export function formatTime12Hour(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function toIsoDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;

  return value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDisplayDate(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  const today = new Date();
  const isToday =
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate();

  const formatted = value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return isToday ? `Today, ${formatted}` : formatted;
}
