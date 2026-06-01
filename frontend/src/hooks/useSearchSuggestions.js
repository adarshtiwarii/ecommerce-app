import { useState, useEffect } from 'react';
import api from '../utils/api';

const useSearchSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/search?keyword=${encodeURIComponent(query)}&page=0&size=5`);
        setSuggestions(res.data.content);
      } catch (err) {
        console.error('Search suggestions error', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
};

export default useSearchSuggestions;

