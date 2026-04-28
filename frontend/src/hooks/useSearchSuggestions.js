import { useState, useEffect } from 'react';
import axios from 'axios';

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
        const res = await axios.get(
          `http://localhost:8080/api/products/search?keyword=${query}&page=0&size=5`
        );
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