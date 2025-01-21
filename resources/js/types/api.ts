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


export interface User {
    id?: string;
    name: string;
    username? : string;
    email: string;
    roleId?: string;
    role?: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserRole {
    id: string;
    name: string;
    description?: string;
    users?: User[];
    createdAt: Date;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'archived';
    issues?: Issue[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GuestIssuer {
    id: string;
    name: string;
    email: string;
    issues?: Issue[];
    createdAt: Date;
}

export interface Issue {
    id: string;
    projectId: string;
    project?: Project;
    reporterId?: string;
    reporter?: User;
    guestIssuerId?: string;
    guestIssuer?: GuestIssuer;
    assigneeId: string;
    assigneeType: string;
    title: string;
    description?: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: Date;
    comments?: Comment[];
    tags?: Tag[];
    history?: IssueHistory[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    id: string;
    issueId: string;
    issue?: Issue;
    userId: string;
    user?: User;
    comment: string;
    createdAt: Date;
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
