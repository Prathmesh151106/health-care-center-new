import { ErrorCode } from './constants.js';

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    details: ApiErrorDetail[];
    requestId: string;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  meta?: Record<string, any>;
}

export interface AuthenticatedUserContext {
  id: string;
  email: string;
  timezone: string;
  locale: string;
}

export interface AssistantChatResponse {
  reply: string;
  disclaimer: string;
  locale: string;
}
