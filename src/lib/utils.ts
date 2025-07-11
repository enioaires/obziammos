import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const differenceInMilliseconds = now.getTime() - date.getTime();
  const differenceInSeconds = differenceInMilliseconds / 1000;
  const differenceInMinutes = differenceInSeconds / 60;
  const differenceInHours = differenceInMinutes / 60;
  const differenceInDays = differenceInHours / 24;

  if (differenceInDays >= 1) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } else if (differenceInHours >= 1) {
    return `${Math.floor(differenceInHours)} hora(s) atrás`;
  } else if (differenceInMinutes >= 1) {
    return `${Math.floor(differenceInMinutes)} minuto(s) atrás`;
  } else {
    return `${Math.floor(differenceInSeconds)} segundo(s) atrás`;
  }
}

export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return timeAgo(timestamp);
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};

export const isUserOnline = (lastSeen: string): boolean => {
  if (!lastSeen) return false;

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

  // Considera online se visto nos últimos 5 minutos
  return diffInMinutes <= 5;
};

export const getOnlineStatus = (lastSeen: string): {
  isOnline: boolean;
  status: string;
  statusColor: string;
  badge: string;
} => {
  if (!lastSeen) {
    return {
      isOnline: false,
      status: 'Nunca visto',
      statusColor: 'text-gray-500',
      badge: 'bg-gray-500'
    };
  }

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

  if (diffInMinutes <= 2) {
    return {
      isOnline: true,
      status: 'Online agora',
      statusColor: 'text-green-400',
      badge: 'bg-green-500'
    };
  } else if (diffInMinutes <= 5) {
    return {
      isOnline: true,
      status: 'Online',
      statusColor: 'text-green-400',
      badge: 'bg-green-500'
    };
  } else if (diffInMinutes <= 30) {
    return {
      isOnline: false,
      status: `Visto há ${Math.floor(diffInMinutes)} min`,
      statusColor: 'text-yellow-400',
      badge: 'bg-yellow-500'
    };
  } else if (diffInMinutes <= 60) {
    return {
      isOnline: false,
      status: `Visto há ${Math.floor(diffInMinutes)} min`,
      statusColor: 'text-orange-400',
      badge: 'bg-orange-500'
    };
  } else if (diffInMinutes <= 1440) { // 24 horas
    const hours = Math.floor(diffInMinutes / 60);
    return {
      isOnline: false,
      status: `Visto há ${hours}h`,
      statusColor: 'text-orange-400',
      badge: 'bg-orange-500'
    };
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return {
      isOnline: false,
      status: `Visto há ${days}d`,
      statusColor: 'text-light-4',
      badge: 'bg-gray-500'
    };
  }
};

export const formatLastSeen = (lastSeen: string): string => {
  if (!lastSeen) return 'Nunca visto';

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInSeconds = (now.getTime() - lastSeenDate.getTime()) / 1000;

  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minuto${minutes !== 1 ? 's' : ''} atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hora${hours !== 1 ? 's' : ''} atrás`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} dia${days !== 1 ? 's' : ''} atrás`;
  }
};

export function extractImageIdsFromCaption(htmlContent: string): string[] {
  if (!htmlContent) return [];

  const imageIds: string[] = [];
  const imgRegex = /<img[^>]+src="[^"]*\/files\/([^"\/]+)\/[^"]*"[^>]*>/g;

  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const imageId = match[1];
    if (imageId && !imageIds.includes(imageId)) {
      imageIds.push(imageId);
    }
  }

  return imageIds;
}