import axios from 'axios';

export const api = axios.create({
  baseURL: typeof window === 'undefined' ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' : '',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchTeacherAvailability(teacherId: string, date: string) {
  const response = await api.post('/api/teachers/availability', { teacherId, date });
  return response.data;
} 