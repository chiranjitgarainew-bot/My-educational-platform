import { User, ClassContent, EnrollmentRequest } from '../types';

// The URL of your Node.js Server
const API_URL = 'http://localhost:5000/api';

/**
 * This service connects to the real Node.js + MongoDB backend.
 * Use this instead of `db.ts` when your server is running.
 */
export const apiService = {
  
  // --- AUTH ---
  async login(email: string, password: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async register(user: User): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // --- CONTENT ---
  async getContent(): Promise<ClassContent[]> {
    const res = await fetch(`${API_URL}/content`);
    return await res.json();
  },

  async uploadContent(content: ClassContent): Promise<void> {
    await fetch(`${API_URL}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
  },

  // --- REQUESTS ---
  async createRequest(request: EnrollmentRequest): Promise<void> {
    await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }
};