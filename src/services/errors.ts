/**
 * Custom domain error classes for business logic & SQLite exceptions
 */

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 400 Bad Request
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InvalidDniError extends ValidationError {
  constructor(message = "El DNI debe contener exactamente 8 dígitos numéricos.") {
    super(message);
  }
}

export class InvalidCoordinatesError extends ValidationError {
  constructor(message = "Coordenadas geográficas inválidas.") {
    super(message);
  }
}

export class InvalidRadiusError extends ValidationError {
  constructor(message = "El radio de cobertura debe estar entre 10 y 5000 metros.") {
    super(message);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = "Acceso no autorizado. Inicia sesión para continuar.") {
    super(message, 401);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = "DNI o contraseña incorrectos.") {
    super(message);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message = "No tienes los permisos necesarios para realizar esta acción.") {
    super(message, 403);
  }
}

export class EventClosedError extends AppError {
  constructor(message = "El registro de asistencia para este evento se encuentra cerrado.") {
    super(message, 400);
  }
}

export class OutOfRadiusError extends AppError {
  public distanceMeters: number;
  public allowedRadius: number;
  public accuracy?: number;

  constructor(distanceMeters: number, allowedRadius: number, accuracy?: number) {
    const hint =
      accuracy && accuracy > 100
        ? ` Tu dispositivo reportó una precisión baja de ±${Math.round(accuracy)}m (posible señal de antena celular o ubicación aproximada). Activa 'Ubicación precisa' en los ajustes de tu navegador.`
        : "";
    super(
      `Te encuentras a aproximadamente ${distanceMeters} metros del lugar del evento, superando el radio permitido de ${allowedRadius} metros.${hint}`,
      400
    );
    this.distanceMeters = distanceMeters;
    this.allowedRadius = allowedRadius;
    this.accuracy = accuracy;
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message = "El recurso solicitado no fue encontrado.") {
    super(message, 404);
  }
}

export class EventNotFoundError extends NotFoundError {
  constructor(codeOrId: string | number) {
    super(`El evento «${codeOrId}» no existe o fue eliminado.`);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`El usuario con DNI ${identifier} no existe.`);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class AttendanceAlreadyRegisteredError extends ConflictError {
  public dni: string;

  constructor(dni: string) {
    super(`Ya se registró previamente la asistencia para el DNI ${dni} en este evento.`);
    this.dni = dni;
  }
}
