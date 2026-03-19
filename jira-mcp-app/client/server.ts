import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

// ---------------------------------------------------------------------------
// Mock Jira REST API v3 data (/rest/api/3/issue/{issueIdOrKey})
// ---------------------------------------------------------------------------

const MOCK_ISSUES: Record<string, object> = {
  "PROJ-101": {
    expand: "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
    id: "10001",
    key: "PROJ-101",
    self: "https://myteam.atlassian.net/rest/api/3/issue/10001",
    fields: {
      summary: "Implement user authentication flow",
      status: {
        name: "In Progress",
        statusCategory: { id: 4, key: "indeterminate", name: "In Progress" },
      },
      priority: { id: "2", name: "High", iconUrl: "https://myteam.atlassian.net/images/icons/priorities/high.svg" },
      issuetype: { id: "10001", name: "Story", subtask: false, iconUrl: "https://myteam.atlassian.net/images/icons/issuetypes/story.svg" },
      assignee: {
        accountId: "5e4a7b2c3d",
        displayName: "Alice Chen",
        emailAddress: "alice.chen@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/alice" },
        active: true,
      },
      reporter: {
        accountId: "5e4a7b2c3e",
        displayName: "Bob Smith",
        emailAddress: "bob.smith@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/bob" },
        active: true,
      },
      project: { id: "10000", key: "PROJ", name: "My Project" },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "As a user, I want to log in with SSO so that I can access the dashboard securely. Acceptance criteria: support Google and GitHub OAuth providers." },
            ],
          },
        ],
      },
      created: "2026-03-01T09:00:00.000+0000",
      updated: "2026-03-12T14:30:00.000+0000",
      labels: ["auth", "frontend", "sprint-12"],
      components: [{ id: "10010", name: "Frontend" }],
      fixVersions: [],
    },
  },
  "PROJ-102": {
    expand: "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
    id: "10002",
    key: "PROJ-102",
    self: "https://myteam.atlassian.net/rest/api/3/issue/10002",
    fields: {
      summary: "Fix pagination bug on search results page",
      status: {
        name: "To Do",
        statusCategory: { id: 2, key: "new", name: "To Do" },
      },
      priority: { id: "1", name: "Highest", iconUrl: "https://myteam.atlassian.net/images/icons/priorities/highest.svg" },
      issuetype: { id: "10004", name: "Bug", subtask: false, iconUrl: "https://myteam.atlassian.net/images/icons/issuetypes/bug.svg" },
      assignee: {
        accountId: "5e4a7b2c3f",
        displayName: "Charlie Davis",
        emailAddress: "charlie.davis@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/charlie" },
        active: true,
      },
      reporter: {
        accountId: "5e4a7b2c40",
        displayName: "Diana Evans",
        emailAddress: "diana.evans@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/diana" },
        active: true,
      },
      project: { id: "10000", key: "PROJ", name: "My Project" },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "When navigating to page 3+ of search results, the page resets to page 1. Reproduced on Chrome and Firefox. Likely a state management issue in the query params hook." },
            ],
          },
        ],
      },
      created: "2026-03-10T11:15:00.000+0000",
      updated: "2026-03-13T08:45:00.000+0000",
      labels: ["bug", "search", "urgent"],
      components: [{ id: "10010", name: "Frontend" }, { id: "10011", name: "Search" }],
      fixVersions: [{ id: "10100", name: "v2.1.0" }],
    },
  },
  "PROJ-103": {
    expand: "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
    id: "10003",
    key: "PROJ-103",
    self: "https://myteam.atlassian.net/rest/api/3/issue/10003",
    fields: {
      summary: "Add dark mode support",
      status: {
        name: "Done",
        statusCategory: { id: 3, key: "done", name: "Done" },
      },
      priority: { id: "3", name: "Medium", iconUrl: "https://myteam.atlassian.net/images/icons/priorities/medium.svg" },
      issuetype: { id: "10001", name: "Story", subtask: false, iconUrl: "https://myteam.atlassian.net/images/icons/issuetypes/story.svg" },
      assignee: {
        accountId: "5e4a7b2c3d",
        displayName: "Alice Chen",
        emailAddress: "alice.chen@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/alice" },
        active: true,
      },
      reporter: {
        accountId: "5e4a7b2c3d",
        displayName: "Alice Chen",
        emailAddress: "alice.chen@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/alice" },
        active: true,
      },
      project: { id: "10000", key: "PROJ", name: "My Project" },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Implement dark mode toggle using CSS custom properties. Should respect system preference and persist user choice in localStorage." },
            ],
          },
        ],
      },
      created: "2026-02-20T10:00:00.000+0000",
      updated: "2026-03-05T16:00:00.000+0000",
      labels: ["ui", "enhancement"],
      components: [{ id: "10010", name: "Frontend" }],
      fixVersions: [{ id: "10099", name: "v2.0.0" }],
    },
  },
  "PROJ-104": {
    expand: "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
    id: "10004",
    key: "PROJ-104",
    self: "https://myteam.atlassian.net/rest/api/3/issue/10004",
    fields: {
      summary: "Set up CI/CD pipeline for staging environment",
      status: {
        name: "In Review",
        statusCategory: { id: 4, key: "indeterminate", name: "In Progress" },
      },
      priority: { id: "2", name: "High", iconUrl: "https://myteam.atlassian.net/images/icons/priorities/high.svg" },
      issuetype: { id: "10002", name: "Task", subtask: false, iconUrl: "https://myteam.atlassian.net/images/icons/issuetypes/task.svg" },
      assignee: {
        accountId: "5e4a7b2c41",
        displayName: "Eve Foster",
        emailAddress: "eve.foster@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/eve" },
        active: true,
      },
      reporter: {
        accountId: "5e4a7b2c3e",
        displayName: "Bob Smith",
        emailAddress: "bob.smith@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/bob" },
        active: true,
      },
      project: { id: "10000", key: "PROJ", name: "My Project" },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Configure GitHub Actions workflow to deploy to staging on every merge to the develop branch. Include lint, test, build, and deploy steps." },
            ],
          },
        ],
      },
      created: "2026-03-08T08:30:00.000+0000",
      updated: "2026-03-14T10:00:00.000+0000",
      labels: ["devops", "ci-cd"],
      components: [{ id: "10012", name: "Infrastructure" }],
      fixVersions: [],
    },
  },
  "PROJ-105": {
    expand: "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
    id: "10005",
    key: "PROJ-105",
    self: "https://myteam.atlassian.net/rest/api/3/issue/10005",
    fields: {
      summary: "Design API rate limiting strategy",
      status: {
        name: "To Do",
        statusCategory: { id: 2, key: "new", name: "To Do" },
      },
      priority: { id: "4", name: "Low", iconUrl: "https://myteam.atlassian.net/images/icons/priorities/low.svg" },
      issuetype: { id: "10003", name: "Spike", subtask: false, iconUrl: "https://myteam.atlassian.net/images/icons/issuetypes/spike.svg" },
      assignee: null,
      reporter: {
        accountId: "5e4a7b2c3f",
        displayName: "Charlie Davis",
        emailAddress: "charlie.davis@example.com",
        avatarUrls: { "48x48": "https://avatar-management.services.atlassian.com/charlie" },
        active: true,
      },
      project: { id: "10000", key: "PROJ", name: "My Project" },
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Research and propose a rate limiting approach for our public API. Consider token bucket vs sliding window algorithms. Document trade-offs." },
            ],
          },
        ],
      },
      created: "2026-03-13T15:00:00.000+0000",
      updated: "2026-03-13T15:00:00.000+0000",
      labels: ["api", "architecture"],
      components: [{ id: "10013", name: "Backend" }],
      fixVersions: [],
    },
  },
};

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Jira MCP App Server",
    version: "0.1.0",
  });

  const resourceUri = "ui://get_issue/mcp-app.html";

  // Register the get_issue tool (matches server PR: issue_id param)
  registerAppTool(
    server,
    "get_issue",
    {
      title: "Get Issue",
      description:
        "Returns the details for the issue.",
      inputSchema: {
        issue_id_or_key: z
          .string()
          .describe("The ID or key of the issue (e.g. PROJ-101)."),
      },
      _meta: { ui: { resourceUri } },
    },
    async ({ issue_id_or_key }): Promise<CallToolResult> => {
      const issue = MOCK_ISSUES[issue_id_or_key.toUpperCase()];

      if (!issue) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Issue "${issue_id_or_key}" not found. Available keys: ${Object.keys(MOCK_ISSUES).join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(issue) }],
      };
    },
  );

  // Register the UI resource (bundled HTML)
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );
      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  return server;
}
