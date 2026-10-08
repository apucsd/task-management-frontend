export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user: ProjectUser;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: ProjectUser;
  members: ProjectMember[];
  _count?: {
    members?: number;
    tasks?: number;
  };
  isOwner?: boolean;
}

export interface UnifiedProjectMember {
  id: string; // memberId or ownerId
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  isOwner: boolean;
}

export interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: "all" | "owned" | "member";
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}
