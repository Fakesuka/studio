/**
 * Утилиты для безопасной обработки и логирования ошибок
 */

/**
 * Безопасно извлекает информацию из объекта Error для логирования
 * Избегает проблем с сериализацией циклических ссылок и несериализуемых объектов
 */
export function safeErrorLog(error: unknown): void {
  if (error instanceof Error) {
    console.error('[Error] Name:', error.name);
    console.error('[Error] Message:', error.message);
    console.error('[Error] Stack:', error.stack);

    // Безопасно логируем дополнительные свойства
    const errorObj = error as any;
    if (errorObj.status) {
      console.error('[Error] HTTP Status:', errorObj.status);
    }
    if (errorObj.endpoint) {
      console.error('[Error] Endpoint:', errorObj.endpoint);
    }
    if (errorObj.timestamp) {
      console.error('[Error] Timestamp:', errorObj.timestamp);
    }

    // Логируем data только если это простой объект
    if (errorObj.data) {
      try {
        // Пытаемся получить основные поля из data
        if (typeof errorObj.data === 'object') {
          if (errorObj.data.error) {
            console.error('[Error] Data.error:', errorObj.data.error);
          }
          if (errorObj.data.message) {
            console.error('[Error] Data.message:', errorObj.data.message);
          }
          if (errorObj.data.details) {
            console.error('[Error] Data.details:', errorObj.data.details);
          }
        }
      } catch (e) {
        console.error('[Error] Could not log error.data (serialization issue)');
      }
    }
  } else {
    // Для не-Error объектов просто преобразуем в строку
    console.error('[Error] Unknown error:', String(error));
  }
}

/**
 * Извлекает безопасное сообщение об ошибке для отображения пользователю
 */
export function getErrorMessage(error: unknown, defaultMessage: string = 'Произошла ошибка'): string {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;

    // Пытаемся извлечь сообщение из различных возможных мест
    if (errorObj.message) {
      return String(errorObj.message);
    }
    if (errorObj.error) {
      return String(errorObj.error);
    }
    if (errorObj.details) {
      return String(errorObj.details);
    }
  }

  return defaultMessage;
}

/**
 * Создает объект с безопасной информацией об ошибке для логирования
 */
export function serializeError(error: unknown): {
  name?: string;
  message: string;
  stack?: string;
  status?: number;
  endpoint?: string;
  timestamp?: string;
} {
  if (error instanceof Error) {
    const errorObj = error as any;

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(errorObj.status && { status: errorObj.status }),
      ...(errorObj.endpoint && { endpoint: errorObj.endpoint }),
      ...(errorObj.timestamp && { timestamp: errorObj.timestamp }),
    };
  }

  return {
    message: String(error),
  };
}

/**
 * Безопасно логирует ошибку с префиксом
 */
export function logError(prefix: string, error: unknown): void {
  console.error(prefix);
  safeErrorLog(error);
}
