import { useState } from "react";
import axios from "axios";

export const useApiMutation = (endpoint: string) => {
  const [isLoading, setLoading] = useState(false);

  const mutate = async (payload: any) => {
    setLoading(true);
    try {
      const response = await axios.post(endpoint, payload, {
        withCredentials:true,
      });

      console.log("Response:", response.data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    isLoading
  };
};
