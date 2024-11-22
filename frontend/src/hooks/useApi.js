import { useEffect, useState } from 'react'

const useApi = (url, method = "GET", payload=null, headers={}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect (() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const options = {
        method,
        headers: {
          ...headers,
          ...(!headers['Content-Type'] && payload && { 'Content-Type': 'application/json' }),
        },
        body: payload ? JSON.stringify(payload) : null,
        signal
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [url, method, payload, headers]);

  return { data, loading, error };
};

export default useApi

/*

  import useApi from "@/hooks/useApi"

  For GET method:
  const { data, loading, error } = useApi(url, 'GET', null, header[if any] );

  For POST method:
  const { data, loading, error } = useApi( url, 'POST', jsonData, header[if any] );

  For PUT method:
  const { data, loading, error } = useApi( url, 'PUT', jsonData, header[if any] );

  For DELETE method:
  const { data, loading, error } = useApi( url, 'DELETE', null, header[if any] );

  Common for any method:
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  
  return (
    <>
      Whatever you need
    </>
  )
*/