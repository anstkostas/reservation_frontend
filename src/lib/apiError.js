export function normalizeApiError(error) {
  // Check if it's a Response object (fetch failure)
  if (error instanceof Response) {
    return error.json().then((data) => {
      return {
        message: data?.message || "An error occurred",
        details: Array.isArray(data?.details) ? data.details : undefined,
      }
    }).catch(() => {
      return { message: "An error occurred" }
    })
  }

  // If the error is already an object with message
  if (error?.message) {
    return {
      message: error.message,
      details: Array.isArray(error.details) ? error.details : undefined,
    }
  }

  // Fallback
  return { message: "An unexpected error occurred" }
}
