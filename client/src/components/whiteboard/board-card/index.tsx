import { Overlay } from "./overlay";
import { formatDistanceToNow } from "date-fns";
import { Actions } from "@/components/action";
import { MoreHorizontal } from "lucide-react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Footer } from "./footer";
import { useAuth } from "@/components/providers/auth";
import { useLocation } from "react-router";
import { useBoards } from "@/store/use-rename-modal";


interface BoardCardProps{
  id:string
  title:string
  imageurl:string
  authorId:string
  authorName:string
  createdAt:number
  groupId:string
  isFavorite:boolean
}

export const BoardCard = ({
  id,
  title,
  imageurl,
  authorId,
  authorName,
  createdAt,
  groupId,
  isFavorite
}:BoardCardProps) =>{
  const {user} = useAuth();

  const authorLabel = authorId === user?.id ? "You" : authorName;

  const createdAtLabel = formatDistanceToNow(new Date(createdAt),{
    addSuffix:true
  });

  // console.log(JSON.stringify({id,title,imageurl,authorId,authorName,createdAt,groupId}));

  const {mutate:onFavorite,isLoading:loadingFavorite} = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/favorite/${id}`); 

  const { mutate: unfavorite } = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/unfavorite/${id}`);

  const location = useLocation();

  const {setIsFavorite} = useBoards();

  const toggleFavorite = () => {
    if(isFavorite){
      console.log("unFavorite",id);
      unfavorite({id})
        .then(()=>{
          setIsFavorite(id,false);
          toast.success("Board unfavorited");
        })
        .catch((e)=>{
          toast.error("Failed to unfavorite board",e.message);
        });
    }else{
      onFavorite({id,groupId})
      .then(()=>{
        setIsFavorite(id,true);
        toast.success("Board favorited");
      })
      .catch((e)=>{
        toast.error(`Failed to favorite board ${e}`);
      });
    }
  }
  const currentPath = location.pathname;
  const boardPath = `${currentPath}/board/${id}`;

  return (
    <Link to={boardPath}>
      <div className="group aspect-[100/127] border rounded-lg flex
      flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          <img
            src={imageurl}
            alt={title}
            className="object-fit absolute inset-0"
          />
          <Overlay/>
          <Actions
            id={id}
            title={title}
            side="right"
          >
            <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity
            px-3 py-2 outline-none">
              <MoreHorizontal
                className="text-white opacity-75 hover:opacity-100 transition-opacity"
              />
            </button>
          </Actions>
        </div>
        <Footer
          isFavorite={isFavorite}
          title={title}
          authorLable={authorLabel}
          createdAtLable={createdAtLabel}
          onClick={toggleFavorite}
          disabled={loadingFavorite}
        />
      </div>
    </Link>
  )
}