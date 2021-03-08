export interface AgentConfig {
  description: string;
  language: string;
  shortDescription: string;
  examples: string;
  linkToDocs: string;
  displayName: string;
  disableInteractionLogs: boolean;
  disableStackdriverLogs: boolean;
  googleAssistant: GoogleAssistantConfig;
  defaultTimezone: string;
  webhook: WebhookConfig;
  isPrivate: boolean;
  mlMinConfidence: number;
  supportedLanguages: unknown[];
  enableOnePlatformApi: boolean;
  onePlatformApiVersion: string;
  secondaryKey: string;
  analyzeQueryTextSentiment: boolean;
  enabledKnowledgeBaseNames: unknown[];
  knowledgeServiceConfidenceAdjustment: number;
  dialogBuilderMode: boolean;
  baseActionPackagesUrl: string;
}

export interface GoogleAssistantConfig {
  googleAssistantCompatible: boolean;
  project: string;
  welcomeIntentSignInRequired: boolean;
  startIntents: unknown[];
  systemIntents: unknown[];
  endIntentIds: unknown[];
  oAuthLinking: GoogleAssistantOAuthLinking;
  voiceType: string;
  capabilities: unknown[];
  env: string;
  protocolVersion: string;
  autoPreviewEnabled: boolean;
  isDeviceAgent: boolean;
}

export interface GoogleAssistantOAuthLinking {
  required: boolean;
  providerId: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string;
  privacyPolicyUrl: string;
  grantType: string;
}

export interface WebhookConfig {
  url: string;
  username: string;
  headers: unknown;
  available: boolean;
  useForDomains: boolean;
  cloudFunctionsEnabled: boolean;
  cloudFunctionsInitialized: boolean;
}
