import { PokerSession, SessionStorage } from '../types';

/**
 * In-memory storage implementation for poker sessions.
 * Can be extended to use Redis or database later.
 */
class InMemoryStorage implements SessionStorage {
  private sessions: Map<string, PokerSession> = new Map();

  async save(session: PokerSession): Promise<void> {
    this.sessions.set(session.id, session);
    console.log(`[Storage] Session saved: ${session.id} - "${session.title}"`);
  }

  async get(id: string): Promise<PokerSession | null> {
    const session = this.sessions.get(id) || null;
    if (session) {
      console.log(`[Storage] Session retrieved: ${id}`);
    }
    return session;
  }

  async delete(id: string): Promise<void> {
    const deleted = this.sessions.delete(id);
    if (deleted) {
      console.log(`[Storage] Session deleted: ${id}`);
    }
  }

  async getAllActive(): Promise<PokerSession[]> {
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => s.state === 'active');
    console.log(`[Storage] Active sessions: ${activeSessions.length}`);
    return activeSessions;
  }

  // Helper method for debugging
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Singleton instance
export const sessionStorage = new InMemoryStorage();
