export interface Intent {
  id: string;
  name: string;
  auto: boolean;
  contexts: string[];
  responses: IntentResponse[];
  priority: number;
  webhookUsed: boolean;
  webhookForSlotFilling: boolean;
  fallbackIntent: boolean;
  events: any[];
  conditionalResponses: any[];
  condition: string;
  conditionalFollowupEvents: any[];
}

export interface IntentResponse {
  resetContexts: boolean;
  action: string;
  affectedContexts: IntentAffectedContext[];
  parameters: IntentParameter[];
  messages: IntentMessage[];
  speech: any[];
}

export interface IntentAffectedContext {
  name: string;
  lifespan: number;
}

export interface IntentMessage {
  type: string;
  title: string;
  payload?: unknown;
  textToSpeech: string;
  lang: string;
  condition: string;
  speech?: string[];
}

export interface IntentPrompt {
  lang: string;
  value: string;
}

export interface IntentParameter {
  id: string;
  name: string;
  required: boolean;
  dataType: string;
  value: string;
  defaultValue: string;
  isList: boolean;
  prompts: IntentPrompt[];
  promptMessages: any[];
  noMatchPromptMessages: any[];
  noInputPromptMessages: any[];
  outputDialogContexts: any[];
}
