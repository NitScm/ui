/**
 * Types mirroring the JSON the nit operations API returns.
 *
 * They are hand-written rather than generated. The API surface is small and
 * stable, and hand-written types let the field comments say what the value
 * means to an operator — which is the part a generator throws away.
 */

export type TaskKind = 'push' | 'pull';

export type TaskState = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

/** A failure reported by the server. Clients branch on `code`, never on `message`. */
export interface ApiError {
  code: string;
  message: string;
  denials?: Denial[];
  retry_after?: number;
}

/** One refused path, with the rule that refused it. */
export interface Denial {
  path: string;
  action: string;
  guard?: string;
  rule_id?: string;
  pattern?: string;
  reason: string;
  description?: string;
}

/** The authenticated caller. */
export interface WhoAmI {
  user: string;
  email: string;
  groups: string[];
  policy_version: string;
}

/** A queued unit of work, as an operator sees it. */
export interface Task {
  id: string;
  kind: TaskKind;
  state: TaskState;

  user: string;
  repository: string;
  branch: string;

  attempts: number;

  /** How many tasks are ahead of this one on the same branch. */
  queue_position?: number;

  /** The worker currently holding the lease. */
  lease_holder?: string;

  created_at: string;
  started_at?: string;
  finished_at?: string;

  /** How long the task ran, or has been running. */
  duration_ms?: number;

  error?: ApiError;
}

/** A task with the raw spec a worker was given and the result it reported. */
export interface TaskDetail extends Task {
  payload?: unknown;
  result?: unknown;
}

/** One immutable line of the audit log. */
export interface AuditRecord {
  id: number;
  occurred_at: string;

  actor: string;
  action: string;

  repository?: string;
  branch?: string;
  path?: string;

  effect?: 'allow' | 'deny';
  reason?: string;
  rule_id?: string;
  guard?: string;

  policy_version: string;
  request_id?: string;
  task_id?: string;
}

/** The dashboard summary. */
export interface Stats {
  policy_version: string;

  tasks: Record<string, number>;

  /** Waiting tasks, and branches currently held by a running push. */
  queue_depth: number;
  busy_branches: number;

  repositories: number;
  users: number;
  groups: number;

  /** Refused paths over the last day: whether the policy is fighting the team. */
  recent_denials: number;
}

/** The compiled policy bundle in force. */
export interface PolicyBundle {
  version: string;
  repositories: PolicyRepository[];
}

export interface PolicyRepository {
  id: string;
  remote: string;
  forge: string;
  default_branch: string;
  rules: PolicyRule[];
}

export interface PolicyRule {
  id: string;
  subject: string;
  except?: string[];
  paths: string[];
  refs?: string[];
  actions: string[];
  effect: 'allow' | 'deny';
  description?: string;
}
