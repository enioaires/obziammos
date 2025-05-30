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
  adventures: string[];
  tags?: string;
};

// ATUALIZADO: adventures array
export type IUpdatePost = {
  postId: string;
  title: string;
  captions: string[];
  imageId: string;
  imageUrl: URL;
  file: File[];
  adventures: string[];
  tags?: string;
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