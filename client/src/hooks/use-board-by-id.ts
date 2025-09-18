import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Board } from '@/store/use-rename-modal';

export const useBoardById = () => {
  const { groupId, boardId: id } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      if (!groupId || !id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/${id}`,
          { withCredentials: true }
        );
        
        const boardData = response.data;
        const formattedBoard: Board = {
          id: boardData.id,
          title: boardData.title,
          imageurl: boardData.imageUrl,
          authorId: boardData.authorId,
          authorName: boardData.authorName,
          createdAt: boardData.createdAt,
          groupId: boardData.groupId,
          isFavorite: boardData.isFavorited
        };
        
        setBoard(formattedBoard);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch board'));
        console.error('Error fetching board:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [groupId, id]);

  const refetch = () => {
    setIsLoading(true);
    // Re-run the effect
    const fetchBoard = async () => {
      if (!groupId || !id) return;
      
      setError(null);
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/${id}`,
          { withCredentials: true }
        );
        
        const boardData = response.data;
        const formattedBoard: Board = {
          id: boardData.id,
          title: boardData.title,
          imageurl: boardData.imageUrl,
          authorId: boardData.authorId,
          authorName: boardData.authorName,
          createdAt: boardData.createdAt,
          groupId: boardData.groupId,
          isFavorite: boardData.isFavorited
        };
        
        setBoard(formattedBoard);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch board'));
        console.error('Error fetching board:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  };

  return { board, isLoading, error, refetch };
};