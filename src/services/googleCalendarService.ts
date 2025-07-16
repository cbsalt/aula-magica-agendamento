import axios from 'axios';

export async function fetchGoogleEvents(teacherId: string, date: string) {
  const response = await axios.post('/api/google/events', { teacherId, date });
  return response.data;
}

export async function fetchGoogleAvailability(teacherId: string, date: string) {
  const response = await axios.post('/api/google/availability', { teacherId, date });
  return response.data;
} 