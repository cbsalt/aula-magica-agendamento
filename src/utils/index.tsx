export function formatDateString(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPeriod(dateStart, dateEnd) {
    return `${formatDateString(dateStart)} - ${formatDateString(dateEnd)}`
}