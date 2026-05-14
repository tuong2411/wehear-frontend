export interface CommunityPost {
  id?: number;
  userId?: number;
  title: String;
  content: String;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  status?: 'ACTIVE' | 'HIDDEN';
  createdAt?: string;
  updatedAt?: string;

  // Bonus/JOIN fields
  userFullName?: string;
  userAvatarUrl?: string;
  likeCount?: number;
  commentCount?: number;
  isLikedByCurrentUser?: boolean;
}

export interface CommunityComment {
  id?: number;
  postId: number;
  userId: number;
  content: string;
  parentId?: number;
  status?: 'ACTIVE' | 'HIDDEN';
  createdAt?: string;

  // Bonus/JOIN fields
  userFullName?: string;
  userAvatarUrl?: string;
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
  replies?: CommunityComment[];
}

export interface CommunityReport {
  id?: number;
  reporterId: number;
  postId?: number;
  commentId?: number;
  reason: string;
  status?: 'PENDING' | 'RESOLVED';
  createdAt?: string;
}
