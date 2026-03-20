class AppError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.data = data;
  }
}

class NetworkError extends AppError {
  constructor(message, data) {
    super(message || 'Network error', 'NETWORK_ERROR', data);
    this.name = 'NetworkError';
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

function reportError(error, context) {
  if (typeof wx.getRealtimeLogManager !== 'function') return;

  const logger = wx.getRealtimeLogManager();
  const code = error && error.code ? error.code : 'UNKNOWN';
  const name = error && error.name ? error.name : 'Error';
  const message = error && error.message ? error.message : '';

  logger.warn('[Error]', { context, code, name, message });
}

function handleError(error, context = '') {
  let message = 'An error occurred';

  if (error instanceof NetworkError) {
    message = 'Network connection failed';
  } else if (error instanceof ValidationError) {
    message = error.message;
  } else if (error && error.message) {
    message = error.message;
  }

  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000,
  });

  reportError(error, context);
}

module.exports = {
  AppError,
  NetworkError,
  ValidationError,
  handleError,
};
