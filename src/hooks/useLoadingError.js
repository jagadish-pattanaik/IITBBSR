import { useState, useCallback } from 'react';

export const useLoadingError = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    console.error(error);
    setError(error.message || 'An unexpected error occurred');
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withLoading = useCallback(async (asyncFn) => {
    try {
      setLoading(true);
      clearError();
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  return {
    loading,
    setLoading,
    error,
    setError,
    clearError,
    withLoading,
    handleError
  };
}; 