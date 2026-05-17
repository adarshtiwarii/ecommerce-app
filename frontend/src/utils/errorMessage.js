export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error?.response?.data ?? error;

  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;

  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).filter(Boolean).join(', ') || fallback;
  }

  return fallback;
};

