export type ApiErrorDetail = { field: string; code: string };

/**
 * Error de la API con sus `details`. Permite que `Crear Libros` sitúe cada error del
 * 422 junto a su campo, en lugar de mostrar un mensaje genérico.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  fieldError(field: string): ApiErrorDetail | undefined {
    return this.details.find((detail) => detail.field === field);
  }
}
