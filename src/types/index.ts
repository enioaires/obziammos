import { LucideIcon } from "lucide-react";

export type INavLink = {
  icon: LucideIcon;
  route: string;
  label: string;
  category?: string;
};

export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  title: string;
  captions: string[];
  file: File[];
  audioFile?: File[];
  adventures: string[];
  tags?: string;
  captionImageIds?: string[];
};

export type IUpdatePost = {
  postId: string;
  title: string;
  captions: string[];
  imageId: string;
  imageUrl: URL;
  file: File[];
  audioFile?: File[];
  audioId?: string;
  audioUrl?: string;
  adventures: string[];
  tags?: string;
  captionImageIds?: string[];
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  role: 'admin' | 'user';
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IAdventure = {
  id: string;
  title: string;
  imageUrl: string;
  imageId: string;
  description?: string;
  status: 'active' | 'inactive';
  isPublic: boolean;
  createdBy: string;
  $createdAt: string;
  $updatedAt: string;
};

export type INewAdventure = {
  title: string;
  description?: string;
  file: File[];
  status: 'active' | 'inactive';
  isPublic: boolean;
  createdBy: string;
};

export type IUpdateAdventure = {
  adventureId: string;
  title: string;
  description?: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
  status: 'active' | 'inactive';
  isPublic: boolean;
};

export type IAdventureParticipant = {
  id: string;
  adventureId: string;
  userId: string;
  addedBy: string;
  $createdAt: string;
};

export type INewAdventureParticipant = {
  adventureId: string;
  userId: string;
  addedBy: string;
};

export type IAdventureOption = {
  label: string;
  value: string;
  status: 'active' | 'inactive';
};

export type IUserAdventures = {
  userId: string;
  adventures: string[];
};

export type IBanner = {
  id: string;
  type: 'home' | 'tag';
  identifier: string;
  imageUrl: string;
  imageId: string;
  title?: string;
  $createdAt: string;
  $updatedAt: string;
};

export type INewBanner = {
  type: 'home' | 'tag';
  identifier: string;
  file: File[];
  title?: string;
};

export type IUpdateBanner = {
  bannerId: string;
  type: 'home' | 'tag';
  identifier: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
  title?: string;
};

export type BannerType = 'home' | 'tag';
export type BannerIdentifier = 'main' | 'mundo' | 'personagens' | 'classes' | 'racas' | 'deuses' | 'artefatos' | 'aventuras' | 'relato' | 'rpg' | 'jogadores' | 'magias' | 'talentos' | 'inventario' | 'irmandades' | 'produtos';

export type IComment = {
  id: string;
  content: string;
  postId: string;
  userId: string;
  parentCommentId?: string;
  $createdAt: string;
  $updatedAt: string;
};

export type INewComment = {
  content: string;
  postId: string;
  userId: string;
  parentCommentId?: string;
};

export type IUpdateComment = {
  commentId: string;
  content: string;
};

export interface IUserWithOnlineStatus extends IUser {
  lastSeen?: string;
  isOnline?: boolean;
}

export type INotification = {
  id: string;
  type: 'like' | 'comment' | 'reply';
  recipientUserId: string;
  triggerUserId: string;
  postId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  $createdAt: string;
  $updatedAt: string;
};

export type INewNotification = {
  type: 'like' | 'comment' | 'reply';
  recipientUserId: string;
  triggerUserId: string;
  postId?: string;
  commentId?: string;
  message: string;
};

export type IUpdateNotification = {
  notificationId: string;
  isRead?: boolean;
};

export type NotificationType = 'like' | 'comment' | 'reply';

export interface INotificationWithUsers extends INotification {
  triggerUser?: {
    id: string;
    name: string;
    username: string;
    imageUrl: string;
  };
  post?: {
    id: string;
    title: string;
  };
}