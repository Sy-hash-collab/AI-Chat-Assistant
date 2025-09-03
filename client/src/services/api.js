import { isRetryableError } from "./utils.js";

const API_BASE = import.meta.env.VITE_API_BASE || ""; 

export async function sendChat({ model, messages }) {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages }),
      });

      if (res.ok) {
        return res.json();
      } else {
        const errorText = await res.text();
        const errorMessage = errorText || `HTTP ${res.status}`;
        
        // Throw an error to be caught by the retry logic below
        throw new Error(errorMessage);
      }
    } catch (error) {
      lastError = error;
      // Only retry if it's a transient server error (like 503)
      if (isRetryableError(error) && retryCount < maxRetries - 1) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Re-throw the error if it's not retryable or max retries are reached
        throw lastError;
      }
    }
  }
  // If the loop finishes without success, throw the last error
  throw lastError;
}