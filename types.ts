
/**
 * FLOWME CORE MODELS
 * We organize these building blocks so the platform can scale from 
 * a single user to a global enterprise with thousands of workers.
 */

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  TIME = 'TIME',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  SELECT = 'SELECT',
  AUTOCOMPLETE = 'AUTOCOMPLETE',
  MASTER_DATA = 'MASTER_DATA',
  ATTACHMENT = 'ATTACHMENT'
}

export enum MasterDataColumnType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN'
}

/**
 * LAYOUT MODES
 * SINGLE_FORM: Optimized for data entry (all fields visible vertically).
 * PAGINATED: Optimized for complex inspections (step-by-step).
 */
export enum LayoutMode {
  SINGLE_FORM = 'SINGLE_FORM',
  PAGINATED = 'PAGINATED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
  GUEST = 'GUEST'
}

export enum VisibilityType {
  PERSONAL = 'PERSONAL',
  GROUP_SHARED = 'GROUP_SHARED',
  PUBLIC_LINK = 'PUBLIC_LINK'
}

/**
 * VALIDATION RULES ENGINE
 * These rules ensure that enterprise data is clean and trusted before 
 * it ever reaches the central database or triggers an integration.
 */
export interface ConditionalRule {
  dependsOnFieldId: string;
  operator: '==' | '!=' | '>' | '<' | 'contains';
  value: any;
}

export interface ValidationRules {
  required: boolean;
  readOnly: boolean;
  min?: number;
  max?: number;
  pattern?: string; // Regex support
  conditionalRequired?: ConditionalRule;
}

/**
 * IDENTITY & MULTI-TENANCY
 */
export type AuthProviderType = 'google' | 'auth0' | 'azure_ad' | 'custom_oidc';

export interface Tenant {
  id: string;
  companyId: string;
  name: string;
  loginDomain: string;
  authProvider: AuthProviderType;
  authConfigJson: string; 
  isActive: boolean;
  brandColor?: string;
}

/**
 * ENTERPRISE INTEGRATIONS
 */
export interface IntegrationConnector {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'apiKey' | 'bearer' | 'none';
  authValue: string;
  headersJson: string;
  createdAt: number;
}

export interface FieldMapping {
  flowFieldId: string;
  externalKey: string;
}

export interface WorkflowIntegrationConfig {
  enabled: boolean;
  connectorId: string;
  endpointPath: string;
  mappings: FieldMapping[];
}

export interface MasterDataSourceConfig {
  connectorId: string;
  endpointPath: string;
  rootPath?: string; 
  mappings: FieldMapping[];
}

export interface VisibilityRule {
  dependsOnFieldId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than';
  value: any;
}

/**
 * USER IDENTITY
 */
export interface User {
  id: string;
  email: string;
  name: string; 
  displayName?: string; 
  picture: string; 
  profilePictureUploaded?: boolean; 
  role: UserRole;
  companyId?: string;
  tenantId?: string;
  authProvider?: AuthProviderType;
  preferredLanguage?: 'en' | 'es' | 'pt-br';
  createdAt?: number;
  updatedAt?: number;
}

export interface Company {
  id: string;
  name: string;
  createdAt: number;
  syncMode: 'auto' | 'manual';
}

export interface Group {
  id: string;
  companyId: string;
  name: string;
}

export interface WorkflowField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean; // Legacy, kept for compatibility
  validation?: ValidationRules;
  options?: string[];
  placeholder?: string;
  masterDataRef?: string;
  visibilityRule?: VisibilityRule;
}

/**
 * WORKFLOW DEFINITION
 */
export interface Workflow {
  id: string;
  title: string;
  description: string;
  category: string;
  layout: LayoutMode;
  fields: WorkflowField[];
  createdAt: number;
  userId: string;
  visibilityType: VisibilityType;
  sharedGroupIds: string[];
  notificationsEnabled: boolean;
  notificationIntervalMinutes: number;
  notifyGroup: boolean;
  notifySpecificUserIds: string[];
  integrationConfig?: WorkflowIntegrationConfig;
  enableReviewBeforeSubmit: boolean;
  isTaskFlow: boolean;
  taskReminderEnabled: boolean;
  reminderIntervalMinutes?: number;
  reminderDeadlineTime?: string;
}

export interface MasterDataTable {
  id: string;
  name: string;
  columns: MasterDataColumn[];
  rows: Record<string, any>[];
  userId: string;
  externalSource?: MasterDataSourceConfig;
}

export interface MasterDataColumn {
  id: string;
  name: string;
  type: MasterDataColumnType;
}

export interface SharedFlowLink {
  token: string;
  workflowId: string;
  ownerUserId: string;
  requireAuth: boolean;
  createdAt: number;
  submissionCount: number;
}

/**
 * WORKFLOW INSTANCE (CONCLUDED)
 */
export interface WorkflowInstance {
  id: string;
  workflowId: string;
  data: Record<string, any>;
  timestamp: number;
  attachments: Record<string, string[]>; 
  userId: string;
  responderUserId?: string;
  responderName?: string;
  responderEmail?: string;
  responderType: 'owner' | 'guest' | 'authenticated_guest';
  durationMs: number;
  completedByUserName: string;
  isSynced: boolean;
  syncError?: string;
  lastSyncAttempt?: number;
  integrationStatus?: 'pending' | 'success' | 'failed';
  integrationError?: string;
}

export type RunStatus = 'running' | 'standby' | 'concluded';

/**
 * WORKFLOW RUN STATUS (IN PROGRESS)
 */
export interface WorkflowRunStatus {
  id: string;
  workflowId: string;
  status: RunStatus;
  startedAt: number;
  lastUpdatedAt: number;
  concludedAt?: number;
  startedByUserId: string;
  startedByName: string;
  draftData: Record<string, any>;
  draftAttachments: Record<string, string[]>;
  lastNudgeAt?: number;
}

export interface AppNotification {
  id: string;
  workflowId: string;
  runId: string;
  type: 'start' | 'reminder' | 'completion' | 'ai_alert' | 'assignment' | 'task_nudge';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  isUrgent: boolean;
}

export type ChatRoomType = 'company' | 'group' | 'workflow' | 'private';

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name: string;
  companyId: string;
  targetId: string; 
  createdAt: number;
  memberIds?: string[];
  picture?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderPicture: string;
  text: string;
  timestamp: number;
  type: 'text' | 'attachment' | 'system';
}

export enum TriggerType {
  DEADLINE_MISSED = 'deadline_missed',
  STILL_RUNNING = 'still_running',
  NOT_STARTED = 'not_started'
}

export interface StructuredAlertRule {
  triggerType: TriggerType;
  deadlineTime?: string; 
  maxDurationMinutes?: number;
  escalationTarget: 'group' | 'specific_user';
}

export interface WorkflowAlertRule {
  id: string;
  ownerUserId: string;
  workflowId: string;
  ruleText: string;
  structuredRule: StructuredAlertRule;
  createdAt: number;
  isActive: boolean;
  lastTriggeredAt?: number;
}

export interface WorkflowAssignment {
  id: string;
  workflowId: string;
  targetGroupId: string;
  recurrence: 'once' | 'daily' | 'weekly' | 'custom';
  startTime?: string; 
  instructionText: string;
  createdAt: number;
  isActive: boolean;
}

/**
 * HELP CENTER
 */
export interface HelpTopic {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'enterprise' | 'ai' | 'field';
}

export interface AIHelpResponse {
  answer_text: string;
  recommended_action_steps: string[];
  related_help_section: string;
}
