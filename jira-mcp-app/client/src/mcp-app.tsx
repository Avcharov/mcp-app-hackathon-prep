import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { memo, StrictMode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "./mcp-app.module.css";
import type { JiraAdfDocument, JiraIssue } from "./types.js";

// ---------------------------------------------------------------------------
// Helpers (module-scope, zero per-render cost)
// ---------------------------------------------------------------------------

function parseIssue(result: CallToolResult): JiraIssue | null {
  const textContent = result.content?.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") return null;
  try {
    return JSON.parse(textContent.text) as JiraIssue;
  } catch {
    return null;
  }
}

function extractError(result: CallToolResult): string {
  const textContent = result.content?.find((c) => c.type === "text");
  if (textContent && textContent.type === "text") return textContent.text;
  return "Unknown error";
}

function adfToPlainText(doc: JiraAdfDocument | null): string {
  if (!doc?.content) return "";
  return doc.content
    .map((block) =>
      block.content?.map((node) => node.text).join("") ?? "",
    )
    .join("\n\n");
}

const STATUS_CLASS_MAP: Record<string, string> = {
  new: styles.statusTodo,
  indeterminate: styles.statusInProgress,
  done: styles.statusDone,
};

const PRIORITY_CLASS_MAP: Record<string, string> = {
  Highest: styles.priorityCritical,
  High: styles.priorityHigh,
  Medium: styles.priorityMedium,
  Low: styles.priorityLow,
  Lowest: styles.priorityLow,
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

// Stable config hoisted out of render
const APP_INFO = { name: "Jira Issue Viewer", version: "0.1.0" } as const;
const APP_CAPABILITIES = {} as const;

// ---------------------------------------------------------------------------
// Root component - sets up MCP App connection
// ---------------------------------------------------------------------------

function JiraApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: APP_INFO,
    capabilities: APP_CAPABILITIES,
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Jira app tearing down");
        return {};
      };

      app.ontoolinput = async (input) => {
        console.info("Received tool input:", input);
      };

      app.ontoolresult = async (result) => {
        console.info("Received tool result:", result);
        setToolResult(result);
      };

      app.ontoolcancelled = (params) => {
        console.info("Tool cancelled:", params.reason);
      };

      app.onerror = console.error;

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (error) return <div className={styles.error}><strong>Connection Error:</strong> {error.message}</div>;
  if (!app) return <div>Connecting to host...</div>;

  return <JiraAppInner app={app} toolResult={toolResult} hostContext={hostContext} />;
}

// ---------------------------------------------------------------------------
// Inner component - issue search & display
// ---------------------------------------------------------------------------

interface JiraAppInnerProps {
  app: App;
  toolResult: CallToolResult | null;
  hostContext?: McpUiHostContext;
}

function JiraAppInner({ app, toolResult, hostContext }: JiraAppInnerProps) {
  const [issueId, setIssueId] = useState("");
  const [issue, setIssue] = useState<JiraIssue | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ref for issueId so handleSearch doesn't depend on it
  const issueIdRef = useRef(issueId);
  issueIdRef.current = issueId;

  // Counter to discard stale responses (race condition guard)
  const requestIdRef = useRef(0);

  // Handle tool results pushed from host
  useEffect(() => {
    if (!toolResult) return;
    if (toolResult.isError) {
      setErrorMsg(extractError(toolResult));
      setIssue(null);
    } else {
      const parsed = parseIssue(toolResult);
      if (parsed) {
        setIssue(parsed);
        setIssueId(parsed.key);
        setErrorMsg(null);
      }
    }
  }, [toolResult]);

  // Stable callback — deps are only [app], not [app, issueId]
  const handleSearch = useCallback(async () => {
    const id = issueIdRef.current.trim();
    if (!id) return;

    const currentRequest = ++requestIdRef.current;
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await app.callServerTool({
        name: "get_issue",
        arguments: { issue_id_or_key: id },
      });

      // Discard if a newer request was fired while we awaited
      if (currentRequest !== requestIdRef.current) return;

      if (result.isError) {
        setErrorMsg(extractError(result));
        setIssue(null);
      } else {
        const parsed = parseIssue(result);
        if (parsed) {
          setIssue(parsed);
          setErrorMsg(null);
        } else {
          setErrorMsg("Failed to parse issue data");
          setIssue(null);
        }
      }
    } catch (e) {
      if (currentRequest !== requestIdRef.current) return;
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "Unexpected error");
      setIssue(null);
    } finally {
      if (currentRequest === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [app]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  // Memoize inline style to avoid new object reference each render
  const safeAreaStyle = useMemo(() => ({
    paddingTop: hostContext?.safeAreaInsets?.top,
    paddingRight: hostContext?.safeAreaInsets?.right,
    paddingBottom: hostContext?.safeAreaInsets?.bottom,
    paddingLeft: hostContext?.safeAreaInsets?.left,
  }), [
    hostContext?.safeAreaInsets?.top,
    hostContext?.safeAreaInsets?.right,
    hostContext?.safeAreaInsets?.bottom,
    hostContext?.safeAreaInsets?.left,
  ]);

  return (
    <main className={styles.main} style={safeAreaStyle}>
      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Enter issue key (e.g. PROJ-101)"
          value={issueId}
          onChange={(e) => setIssueId(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch} disabled={loading || !issueId.trim()}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {errorMsg && <div className={styles.error}>{errorMsg}</div>}

      {!issue && !errorMsg && (
        <p className={styles.hint}>
          Search for a Jira issue or the host will display the result automatically.
        </p>
      )}

      {issue && <IssueCard issue={issue} />}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Issue card component (memoized — skips re-render on parent keystroke)
// ---------------------------------------------------------------------------

const IssueCard = memo(function IssueCard({ issue }: { issue: JiraIssue }) {
  const { fields } = issue;
  const descriptionText = useMemo(
    () => adfToPlainText(fields.description),
    [fields.description],
  );

  return (
    <div className={styles.issueCard}>
      <div className={styles.issueHeader}>
        <span className={styles.issueKey}>{issue.key}</span>
        <span className={styles.issueType}>{fields.issuetype.name}</span>
      </div>

      <div className={styles.issueSummary}>{fields.summary}</div>

      <div className={styles.issueBody}>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Status</span>
            <span className={`${styles.badge} ${STATUS_CLASS_MAP[fields.status.statusCategory.key] ?? ""}`}>
              {fields.status.name}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Priority</span>
            <span className={`${styles.fieldValue} ${PRIORITY_CLASS_MAP[fields.priority.name] ?? ""}`}>
              {fields.priority.name}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Assignee</span>
            <span className={styles.fieldValue}>
              {fields.assignee?.displayName ?? "Unassigned"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Reporter</span>
            <span className={styles.fieldValue}>{fields.reporter.displayName}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Project</span>
            <span className={styles.fieldValue}>{fields.project.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Created</span>
            <span className={styles.fieldValue}>{formatDate(fields.created)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Updated</span>
            <span className={styles.fieldValue}>{formatDate(fields.updated)}</span>
          </div>
          {fields.components.length > 0 && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Components</span>
              <span className={styles.fieldValue}>
                {fields.components.map((c) => c.name).join(", ")}
              </span>
            </div>
          )}
        </div>

        {descriptionText && (
          <div>
            <span className={styles.fieldLabel}>Description</span>
            <div className={styles.description}>{descriptionText}</div>
          </div>
        )}

        {fields.labels.length > 0 && (
          <div>
            <span className={styles.fieldLabel}>Labels</span>
            <div className={styles.labels}>
              {fields.labels.map((label) => (
                <span key={label} className={styles.label}>{label}</span>
              ))}
            </div>
          </div>
        )}

        {fields.fixVersions.length > 0 && (
          <div>
            <span className={styles.fieldLabel}>Fix Versions</span>
            <div className={styles.labels}>
              {fields.fixVersions.map((v) => (
                <span key={v.id} className={styles.label}>{v.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JiraApp />
  </StrictMode>,
);
