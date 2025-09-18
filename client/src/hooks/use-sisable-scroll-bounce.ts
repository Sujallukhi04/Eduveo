import { useEffect } from "react";

export const useDisableSchrollBounce = () => {
  useEffect(() => {
    document.body.classList.add("overflow-hidden","overscroll-none");
    return () => {
      document.body.classList.remove("overflow-hidden","overscroll-none");
    };
  }, []);
};