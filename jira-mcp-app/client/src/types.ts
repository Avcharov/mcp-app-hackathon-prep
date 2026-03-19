// Jira REST API v3 types (/rest/api/3/issue/{issueIdOrKey})

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  avatarUrls: Record<string, string>;
  active: boolean;
}

export interface JiraStatusCategory {
  id: number;
  key: string;
  name: string;
}

export interface JiraStatus {
  name: string;
  statusCategory: JiraStatusCategory;
}

export interface JiraPriority {
  id: string;
  name: string;
  iconUrl: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
  subtask: boolean;
  iconUrl: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export interface JiraComponent {
  id: string;
  name: string;
}

export interface JiraVersion {
  id: string;
  name: string;
}

export interface JiraAdfTextNode {
  type: "text";
  text: string;
}

export interface JiraAdfParagraph {
  type: "paragraph";
  content: JiraAdfTextNode[];
}

export interface JiraAdfDocument {
  type: "doc";
  version: number;
  content: JiraAdfParagraph[];
}

export interface JiraIssueFields {
  summary: string;
  status: JiraStatus;
  priority: JiraPriority;
  issuetype: JiraIssueType;
  assignee: JiraUser | null;
  reporter: JiraUser;
  project: JiraProject;
  description: JiraAdfDocument | null;
  created: string;
  updated: string;
  labels: string[];
  components: JiraComponent[];
  fixVersions: JiraVersion[];
}

export interface JiraIssue {
  expand?: string;
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
}
