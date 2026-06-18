export function parseErrorMessage(err: any, fallbackMessage: string = 'An unexpected error occurred. Please try again.'): string {
  if (!err) {
    return fallbackMessage;
  }

  // Network or CORS failure
  if (err.status === 0) {
    return 'Network error: Connection failed or CORS request blocked by the browser. Please verify the backend server is running and allowing cross-origin requests.';
  }

  // Handle structured error formats from backend
  if (err.error) {
    // If error is a plain string
    if (typeof err.error === 'string') {
      return err.error;
    }

    // If error is a JSON object
    if (typeof err.error === 'object') {
      // Common Spring Boot / Standard API error fields
      if (err.error.message && typeof err.error.message === 'string') {
        return err.error.message;
      }
      if (err.error.error && typeof err.error.error === 'string') {
        return err.error.error;
      }
      if (err.error.details && typeof err.error.details === 'string') {
        return err.error.details;
      }

      // Check if it is a ProgressEvent or other browser event objects
      if (err.error.constructor && err.error.constructor.name === 'ProgressEvent') {
        return 'Browser blocked the network request (CORS or server offline).';
      }
    }
  }

  // Fallback to standard status text or message
  if (err.status && err.statusText) {
    return `Server returned error status ${err.status}: ${err.statusText}`;
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return fallbackMessage;
}
