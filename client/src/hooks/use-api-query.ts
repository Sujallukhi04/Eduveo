import axios from "axios";
import { useEffect, useState } from "react";


export const useApiQuery = (endpoint:string, params:any) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoint, { params,withCredentials:true });
        setData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint, params]);
  
  return { data, loading, error };
};