import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { LayoutDashboard, Star } from "lucide-react";
import { SearchInput } from "./search-input";

export const OrgSidebar = () => {
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(window.location.search);
    const favorites = searchParams.get("favorites") === "true";

    const handleTeamBoardsClick = () => {
        searchParams.delete("favorites");
        navigate(`?${searchParams.toString()}`, { replace: true });
    };

    const handleFavoritesClick = () => {
        searchParams.set("favorites", "true");
        navigate(`?${searchParams.toString()}`, { replace: true });
    };

  return (
      <div className="hidden lg:flex flex-col space-y-6 w-[206px]">
          <SearchInput />
          <div className="space-y-1 w-full">
              <Button size="lg" className="font-normal justify-start px-2 w-full" variant={favorites ? "ghost" : "secondary"} onClick={handleTeamBoardsClick}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Team boards
              </Button>
              <Button size="lg" className="font-normal justify-start px-2 w-full" variant={favorites ? "secondary" : "ghost"} onClick={handleFavoritesClick} >
                  <Star className="mr-2 h-4 w-4" />
                  Favorite boards
              </Button>
          </div>
      </div>
  );
};