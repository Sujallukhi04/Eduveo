import { Search } from "lucide-react";
import qs from "query-string";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDebounceCallback } from "usehooks-ts";
import { Input } from "../ui/input";


export const SearchInput = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const debounce = useDebounceCallback(setValue, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      debounce(e.target.value);
  };

  useEffect(() => {
      const url = qs.stringifyUrl({
          url: `/groups/${groupId}`,
          query: { Search: value },
      }, { skipEmptyString: true, skipNull: true });

      navigate(url);
  }, [value, navigate]);

  return (
      <div className="w-full relative">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input className="w-full max-w-[516px] pl-9" placeholder="Search boards..." onChange={handleChange} />
      </div>
  );
};