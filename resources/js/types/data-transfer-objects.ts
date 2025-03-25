import { Issue, IssueLog, Project, Tag, Team, User, UserRole } from "./api";

export type CreateUserDTO = Omit<User, "id" | "role" | "createdAt" | "updatedAt">;

export type UpdateUserDTO = Partial<Omit<User, "createdAt" | "updatedAt">>;

export type UserResponseDTO = Omit<User, "role"> & { role?: UserRole };


export type CreateUserRoleDTO = Omit<UserRole, "id" | "users" | "createdAt">;

export type UpdateUserRoleDTO = Partial<Omit<UserRole, "users" | "createdAt">>;


export type CreateIssueDTO = Omit<Issue, "id" | "project" | "reporter" | "assignee" | "comments" | "tags" | "history" | "createdAt" | "updatedAt">;

export type UpdateIssueDTO = Partial<Omit<Issue, "createdAt" | "updatedAt">>;

export type IssueResponseDTO = Omit<Issue, "comments" | "tags" | "history"> & {
    commentCount?: number;
    tagList?: string[];
};


export type CreateTeamDTO = Omit<Team, "id" | "members" | "createdAt" | "updatedAt">;

export type UpdateTeamDTO = Partial<Omit<Team, "createdAt" | "updatedAt">>;

export type TeamResponseDTO = Omit<Team, "members"> & { memberCount?: number };


export type CreateCommentDTO = Omit<Comment, "id" | "createdAt" | "updatedAt" | "commentable" | "commenter">;

export type UpdateCommentDTO = Partial<Omit<Comment, "createdAt" | "updatedAt">>;

export type CommentResponseDTO = Comment;


export type CreateTagDTO = Omit<Tag, "id" | "issues" | "createdAt">;

export type UpdateTagDTO = Partial<Omit<Tag, "issues" | "createdAt">>;

export type TagResponseDTO = Omit<Tag, "issues">;

export type CreateIssueLogDTO = Omit<IssueLog, "id" | "createdAt" | "updatedAt">;

export type IssueLogResponseDTO = IssueLog;

export type CreateProjectDTO = Omit<Project, "id" | "issues" | "createdAt" | "updatedAt">;

export type UpdateProjectDTO = Partial<Omit<Project, "issues" | "createdAt" | "updatedAt">>;

export type ProjectResponseDTO = Omit<Project, "issues"> & { issueCount?: number };

