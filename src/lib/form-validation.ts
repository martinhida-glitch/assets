export class FormValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormValidationError";
  }
}

type TextOptions = {
  min?: number;
  max?: number;
  optional?: boolean;
  label?: string;
};

export function formText(
  formData: FormData,
  key: string,
  options: TextOptions = {},
): string {
  const raw = formData.get(key);
  const value = typeof raw === "string" ? raw.trim() : "";
  const label = options.label || key;

  if (!value && options.optional) return "";
  if (!value) throw new FormValidationError(`Completá ${label}.`);
  if (options.min != null && value.length < options.min) {
    throw new FormValidationError(`${label} debe tener al menos ${options.min} caracteres.`);
  }
  if (options.max != null && value.length > options.max) {
    throw new FormValidationError(`${label} no puede superar ${options.max} caracteres.`);
  }
  return value;
}

export function formEmail(formData: FormData, key = "email"): string {
  const value = formText(formData, key, { min: 5, max: 254, label: "el correo" }).toLowerCase();
  const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmail.test(value)) throw new FormValidationError("Ingresá un correo válido.");
  return value;
}

export function formChoice<const T extends readonly string[]>(
  formData: FormData,
  key: string,
  allowed: T,
  label = key,
): T[number] {
  const value = formText(formData, key, { label });
  if (!allowed.includes(value)) throw new FormValidationError(`Seleccioná un valor válido para ${label}.`);
  return value as T[number];
}

export function formInteger(
  formData: FormData,
  key: string,
  options: { min?: number; max?: number; label?: string } = {},
): number {
  const value = Number(formText(formData, key, { label: options.label || key }));
  if (!Number.isInteger(value)) throw new FormValidationError(`${options.label || key} debe ser un número entero.`);
  if (options.min != null && value < options.min) throw new FormValidationError(`${options.label || key} es demasiado bajo.`);
  if (options.max != null && value > options.max) throw new FormValidationError(`${options.label || key} es demasiado alto.`);
  return value;
}

export function optionalMoney(formData: FormData, key: string, label: string): number | null {
  const raw = formData.get(key);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number) || number < 0) throw new FormValidationError(`${label} debe ser un monto válido.`);
  return Math.round(number * 100) / 100;
}

export function assertUuid(value: string, label = "identificador"): string {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(value)) throw new FormValidationError(`${label} no es válido.`);
  return value;
}
