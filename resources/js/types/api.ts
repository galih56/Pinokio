export type BaseEntity = {
    id: string;
    updatedAt: Date;
    createdAt: Date;
};

export type Option = {
    value : string;
    label : string;
}
  
export type Callback<T> = (value?: T) => void;

/* Metadata for pagination */
export interface PaginationParams { page?: number; perPage?: number; search?: string };
export type Meta = {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
};
  
export type AuthResponse = {
    status : string;
    accessToken : string;
    tokenType : string;
    data: User;
};

export interface User extends BaseEntity {
    name: string;
    username?: string;
    email: string;
    roleId?: string;
    role?: UserRole;
}

export interface UserRole {
    id: string;
    name: string;
    description?: string;
    users?: User[];
    createdAt: Date;
}

export interface Project extends BaseEntity  {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'archived';
    issues?: Issue[];
}

export interface GuestIssuer {
    id: string;
    name: string;
    email: string;
    issues?: Issue[];
}

export interface Team extends BaseEntity  {
    id: string;
    name: string;
    email: string;
    issues?: Issue[];
}

export interface Issue extends BaseEntity  {
    id: string;
    projectId: string;
    project?: Project;
    reporterId?: string;
    reporter?: User;
    issuer_id?: string;
    issuer?: GuestIssuer | User;
    assigneeId: string;
    assigneeType: string;
    assignee? : User | Team;
    title: string;
    description?: string;
    status: 'open' | 'idle' | 'in progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: Date;
    comments?: Comment[];
    tags?: Tag[];
    history?: IssueHistory[];
}

export interface Task { 
    id: string;
    title: string;
    due_date: string;
    type: 'task'; 
}


export interface Tag {
    id: string;
    name: string;
    color: string;
    issues?: Issue[];
    createdAt: Date;
}

export interface IssueTag {
    id: string;
    issueId: string;
    issue?: Issue;
    tagId: string;
    tag?: Tag;
}

export interface IssueHistory {
    id: string;
    issueId: string;
    issue?: Issue;
    userId: string;
    user?: User;
    action: 'created' | 'updated' | 'statusChange' | 'commentAdded';
    actionDetails?: string;
    createdAt: Date;
}

export interface Comment extends BaseEntity{
    id: string;
    comment: string;
    commentableId: string;
    commentableType: string;
    commenterId: string;
    commenterType: string;
    commentable: Commentable;
    commenter: Commenter; 
}

export interface Commenter {
    id: string;
    name: string; 
    email?: string; 
}

export type Commentable = Issue | Project | Task; 