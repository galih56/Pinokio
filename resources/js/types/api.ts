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
    id: string;
    avatar?: string;
    name: string;
    username?: string;
    email: string;
    roleId?: string;
    role?: UserRole;
}

export interface UserRole {
    id: string;
    code: string;
    name: string;
    description?: string;
    users?: User[];
    createdAt: Date;
    updatedAt: Date;
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
    description: string;
    color: string;
    members : User[]
}

export interface Issue extends BaseEntity  {
    id: string;
    projectId: string;
    project?: Project;
    reporterId?: string;
    reporter?: User;
    issuer_id: string;
    issuer?: GuestIssuer | User;
    assigneeId: string;
    assigneeType: string;
    assignee? : User | Team;
    title: string;
    description?: string;
    status: 'open' | 'idle' | 'in progress' | 'resolved' | 'closed';
    priority: 'unverified' | 'low' | 'medium' | 'high' | 'critical';
    dueDate?: Date;
    comments?: Comment[];
    tags?: Tag[];
    history?: IssueLog[];
    unreadCommentsCount? : number;
    unreadComments? : Comment[];
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
    isPublic: boolean;
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

export interface Comment extends BaseEntity{
    id: string;
    comment: string;
    isRead: boolean;
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
    type?: 'guest_issuer' | 'user';
}

export type Commentable = Issue | Project | Task; 

export type File = {
    id: string;
    name : string;
    url : string;
    mimeType : string;
    size : string;
    uploadedAt : Date;
}

export type ActionDetails = 
  | { updatedFields: string[] }
  | { previousStatus: string; newStatus: string }
  | { description: string };

export interface IssueLog  extends BaseEntity  {
  issueId?: number;
  userId: string | null;
  userType?: string;
  action: 'updated' | 'status_change' | 'created' | 'deleted';
  actionDetails: ActionDetails;
};  

export const isIssue = (commentable: Issue | Project | Task): commentable is Issue =>
    (commentable as Issue).issuer !== undefined;

export const getCommentableCreator = (commentable?: Issue | Project | Task) => {
    if (!commentable) return null;

    if (isIssue(commentable)) {
        return commentable.issuer; 
    } 

    return null;
};

export interface Form {
  id: string;
  title: string;
  type: 'internal' | 'google';
  formCode?: string;
  provider : 'Pinokio' | 'Google Form'
  formUrl?: string;
  description?: string;
  accessType: 'public' | 'token' | 'identifier';
  identifierLabel?: string;
  identifierDescription?: string;
  identifierType?: string;
  timeLimitMinutes: number;
  allowMultipleAttempts: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormTemplate {
  id: string;
  formId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormGroup {
  id: string;
  formTemplateId: string;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FieldType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  formGroupId: string;
  fieldTypeId: string;
  label: string;
  name: string;
  placeholder?: string;
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormFieldOption {
  id: string;
  formFieldId: string;
  label: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormToken {
  id: string;
  formId: string;
  token: string;
  identifier?: string;
  openTime?: string;
  submittedTime?: string;
  isUsed: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormAttempt {
  id: string;
  formId: string;
  tokenId?: number;
  identifier?: string;
  startedAt: string;
  submittedAt?: string;
  isValid: boolean;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formTemplateId: string;
  submittedBy?: number;
  submittedAt: string;
}

export interface FormEntry {
  id: string;
  formSubmissionId: string;
  formFieldId: string;
  value: string;
}


