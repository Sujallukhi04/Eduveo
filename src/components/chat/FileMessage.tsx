'use client';

import { format } from 'date-fns';
import { File as FileIcon, Download, Image as ImageIcon, FileText, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface User { id: string; name: string | null; image?: string | null; }
interface FileData {
  id: string;
  name: string;
  url: string;
  fileType: string;
  size: number;
  createdAt: Date;
  user: { id: string; name: string | null; avatarUrl?: string | null; };
}
interface FileMessageProps { file: FileData; currentUser: User; }

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
  if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  if (fileType.startsWith('application/zip') || fileType.startsWith('application/x-rar')) return <FileArchive className="h-8 w-8 text-yellow-500" />;
  return <FileIcon className="h-8 w-8 text-gray-500" />;
};

export default function FileMessage({ file, currentUser }: FileMessageProps) {
  const isAuthor = file.user.id === currentUser.id;

  return (
    <div className={`flex items-end gap-2 py-1 ${isAuthor ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col space-y-1 text-base max-w-xs mx-2 ${isAuthor ? 'order-1 items-end' : 'order-2 items-start'}`}>
        <div className={`p-3 rounded-lg flex items-center gap-3 ${isAuthor ? 'rounded-br-none bg-blue-600 text-white' : 'rounded-bl-none bg-gray-200 dark:bg-gray-700'}`}>
          {getFileIcon(file.fileType)}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${isAuthor ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{file.name}</p>
            <p className={`text-xs ${isAuthor ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{formatBytes(file.size)}</p>
          </div>
          <Link href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" passHref>
            <Button asChild size="icon" variant={isAuthor ? 'secondary' : 'default'}>
              <a><Download className="h-4 w-4" /></a>
            </Button>
          </Link>
        </div>
        <span className="text-xs text-gray-500">
          {file.user.name} - {format(new Date(file.createdAt), 'p')}
        </span>
      </div>
    </div>
  );
}