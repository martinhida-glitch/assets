export function formatMoney(min?: number | null, max?: number | null, mode = "open") {
  if (mode === "open" || (min == null && max == null)) return "A convenir";
  const f = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  if (min != null && max != null && Number(min) !== Number(max)) return `${f.format(Number(min))} – ${f.format(Number(max))}`;
  return f.format(Number(min ?? max ?? 0));
}

export function relativeTime(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

export function expirationLabel(value?: string | null) {
  if (!value) return "Sin vencimiento";
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "Finalizada";
  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return `Vence en ${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `Vence en ${hours} h`;
  return `Vence en ${Math.ceil(hours / 24)} d`;
}

export function statusLabel(status: string) {
  return ({ open: "Abierta", assigned: "Asignada", completed: "Completada", cancelled: "Cancelada", pending: "Pendiente", accepted: "Aceptada", rejected: "Rechazada", withdrawn: "Retirada" } as Record<string, string>)[status] || status;
}
