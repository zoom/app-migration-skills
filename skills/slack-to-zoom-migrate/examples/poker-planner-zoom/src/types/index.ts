export interface ZoomWebhookPayload {
  event: string;
  payload: {
    accountId: string;
    userJid: string;
    userName: string;
    robotJid: string;
    cmd: string;
    timestamp: number;
    toJid: string;
    userId: string;
    channelName?: string;
    plainToken?: string;
    triggerId?: string;
    actionItem?: {
      text: string;
      value: string;
    };
  };
}

export interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

export interface CachedBotToken {
  token: string;
  expiresAt: number;
}

export interface MessageBody {
  robot_jid: string;
  to_jid: string;
  account_id: string;
  user_jid: string;
  is_markdown_support?: boolean;
  content: {
    head?: {
      text: string;
    };
    body: Array<{
      type: string;
      text?: string;
      items?: any[];
      [key: string]: any;
    }>;
  };
}

// Poker Planner specific types
export interface PokerSession {
  id: string;
  title: string;
  points: string[];
  votes: { [userJid: string]: string };
  state: 'active' | 'revealed' | 'cancelled';
  channelId: string;
  teamId: string;
  creatorId: string;
  creatorName: string;
  messageId: string;
  createdAt: number;
  endsAt?: number;
  protected: boolean;
  average: boolean;
  participants: string[];
}

export interface SessionStorage {
  save(session: PokerSession): Promise<void>;
  get(id: string): Promise<PokerSession | null>;
  delete(id: string): Promise<void>;
  getAllActive(): Promise<PokerSession[]>;
}
