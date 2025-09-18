import { useEffect, useState } from 'react';
import {  useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { EmptyBoard, EmptyFavorites, EmptySearch } from './empty-board';
import { BoardCard } from './board-card';
import { NewBoardButton } from './new-board-button';
import { Board, useBoards } from '@/store/use-rename-modal';

interface BoardListProps {
  groupId: string;
}

export const BoardList = ({ groupId }: BoardListProps) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const {initialValue,setBoards} = useBoards();
  const [data, setData] = useState<Board[]>(initialValue);
  const query = {
    search: searchParams.get("Search") || "",
    favorites: searchParams.get("favorites") || "",
  };

  useEffect(() => {
    searchParams.delete("fetch");
    const fetchBoards = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/list`, {
          params: {
            search: query.search,
          },
          withCredentials: true,
        });
        console.log(response.data);

        //@ts-ignore
        const result = response.data.map((board)=>{
          return {
            id: board.id,
            title: board.title,
            authorId: board.authorId,
            authorName: board.authorName,
            imageurl: board.imageurl,
            groupId: board.groupId,
            createdAt: board.createdAt,
            updatedAt: board.updatedAt,
            isFavorite: board.isFavorited
          }
        });
        
        setBoards(result);
        setData(result);

      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [groupId]);

  useEffect(() => {
    if (initialValue.length > 0) {
      if (query.search) {
        const filteredData = initialValue.filter(board => 
          board.title.toLowerCase().includes(query.search.toLowerCase())
        );
        setData(filteredData);
      } else {
        setData(initialValue);
      }
    }
  }, [query.search, initialValue]);
  
  useEffect(() => {
    if (initialValue.length > 0) {
      if (query.favorites) {
        const favoriteBoards = initialValue.filter(board => board.isFavorite);
        setData(favoriteBoards);
      } else {
        setData(initialValue);
      }
    }
  }, [query.favorites, initialValue]);

  useEffect(()=>{
    setData(initialValue);
  },[initialValue])

  
  if (loading) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favorites ? "Favorite Boards" : "Group Boards"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mt-8 pb-10">
          <NewBoardButton  groupId={groupId} disabled/>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[100/127] bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if(data.length === 0 && !!query.favorites) {
    return (
      <EmptyFavorites/>
    )
  }
  
  if(data.length === 0 && !!query.search) {
    return (
      <EmptySearch/>
    )
  }
  
  
  if (!data?.length) {
    return <EmptyBoard />;
  }


  console.log("Boards for store:",{data,initialValue});
  return (
    <div>
      <h2 className="text-3xl">
        {query.favorites ? "Favorite Boards" : "Group Boards"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mt-8 pb-10">
       {!query.favorites  &&  <NewBoardButton  groupId={groupId}/>}
        {data.map((board) => (
          <BoardCard
            key={board.id}
            id={board.id}
            groupId={groupId}
            title={board.title}
            imageurl={board.imageurl}
            authorId={board.authorId}
            authorName={board.authorName}
            createdAt={board.createdAt}
            isFavorite={board.isFavorite}
          />
        ))}
      </div>
    </div>
  );
};
