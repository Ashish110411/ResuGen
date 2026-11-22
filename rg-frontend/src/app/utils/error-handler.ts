/**
 * Resolves the service name and target endpoint from an error object.
 */
function resolveServiceDetails(err: any, customServiceName?: string): { name: string; url: string } {
  const url = (err && typeof err.url === 'string') ? err.url : '';

  if (customServiceName) {
    return { name: customServiceName, url };
  }

  if (url.includes(':8888') || url.includes('compiler') || url.includes('/builds/')) {
    return { name: 'LaTeX Compiler Service', url };
  }

  if (url.includes(':7777') || url.includes('/api/auth') || url.includes('/api/resumes') || url.includes('resugen.onrender.com')) {
    return { name: 'Backend API Server', url };
  }

  return { name: 'Server', url };
}

export function parseErrorMessage(
  err: any,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.',
  serviceName?: string
): string {
  if (!err) {
    return fallbackMessage;
  }

  const { name: targetService, url: targetUrl } = resolveServiceDetails(err, serviceName);
  const endpointHint = targetUrl ? ` (${targetUrl})` : '';

  // Network or CORS failure (Status 0)
  if (err.status === 0) {
    if (targetService === 'LaTeX Compiler Service') {
      return `LaTeX Compiler Connection Error: Unable to reach the compiler service${endpointHint}. The connection failed or was blocked by browser CORS policy. Please ensure the compiler server is running (port 8888) and allowing cross-origin requests.`;
    }
    if (targetService === 'Backend API Server') {
      return `Backend Connection Error: Unable to reach the backend server${endpointHint}. The connection failed or was blocked by browser CORS policy. Please ensure the backend server is running (port 7777) and allowing cross-origin requests.`;
    }
    return `Network Error: Connection failed or was blocked by browser CORS policy${endpointHint}. Please verify the target service is online and allowing cross-origin requests.`;
  }

  // 404 Not Found
  if (err.status === 404) {
    return `${targetService} Error (404 Not Found): The requested endpoint${endpointHint} was not found.`;
  }

  // 401 Unauthorized / 403 Forbidden
  if (err.status === 401) {
    return 'Authentication Failed (401): Invalid credentials or session expired. Please log in again.';
  }
  if (err.status === 403) {
    return 'Access Denied (403): You do not have permission to perform this action.';
  }

  // 429 Too Many Requests
  if (err.status === 429) {
    return `${targetService} Busy (429): Rate limit exceeded or compiler is busy processing other jobs. Please retry in a few moments.`;
  }

  // 504 Gateway Timeout
  if (err.status === 504) {
    return `${targetService} Timeout (504): The request timed out. Please check for infinite loops or syntax errors in LaTeX macros.`;
  }

  // Handle structured error formats from backend / compiler
  if (err.error) {
    // If error is a plain string
    if (typeof err.error === 'string') {
      return err.error;
    }

    // If error is a JSON object
    if (typeof err.error === 'object') {
      if (err.error.log && typeof err.error.log === 'string') {
        return err.error.log;
      }
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
        return `${targetService} Network Blocked: Browser could not connect to ${targetUrl || 'service'}. Verify the server is running and CORS is enabled.`;
      }
    }
  }

  // Fallback to standard status text or message
  if (err.status && err.statusText) {
    return `${targetService} Error (Status ${err.status}): ${err.statusText}`;
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return fallbackMessage;
}
