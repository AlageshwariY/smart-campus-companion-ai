import { Profile, AttendanceRecord, TimetableSlot, Assignment, AssignmentSubmission, Exam, StudyMaterial, CampusEvent, Announcement, NotificationItem } from '../types';

// API Configuration
const RENDER_BACKEND_URL = 'https://smart-campus-companion-ai.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:5000';

// Determine base URL dynamically
const BASE_URL = import.meta.env.VITE_BACKEND_URL || RENDER_BACKEND_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errorBody.message || errorBody.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    // If remote backend fails (e.g. Render cold start or network error), try local server fallback if running
    if (BASE_URL !== LOCAL_BACKEND_URL && !endpoint.startsWith('http')) {
      try {
        const localUrl = `${LOCAL_BACKEND_URL}${endpoint}`;
        const localRes = await fetch(localUrl, { ...options, headers });
        if (localRes.ok) {
          return await localRes.json();
        }
      } catch {
        // Fallthrough to throw original error
      }
    }
    throw err;
  }
}

export const api = {
  // Auth & Profile
  async register(profileData: Partial<Profile> & { password?: string }): Promise<{ user: Profile; token?: string }> {
    return request<{ user: Profile; token?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },

  async login(credentials: { email: string; password?: string; role?: string }): Promise<{ user: Profile; token?: string }> {
    return request<{ user: Profile; token?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async getProfile(userId: string): Promise<Profile> {
    return request<Profile>(`/api/profiles/${userId}`);
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    return request<Profile>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async getAllProfiles(): Promise<Profile[]> {
    return request<Profile[]>('/api/students');
  },

  // Attendance
  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    return request<AttendanceRecord[]>(`/api/attendance/${studentId}`);
  },

  async updateAttendance(studentId: string, subjectId: string, presentDays: number, totalDays: number): Promise<AttendanceRecord> {
    return request<AttendanceRecord>('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, subject_id: subjectId, present_days: presentDays, total_days: totalDays })
    });
  },

  // Timetable
  async getTimetable(department?: string, year?: string): Promise<TimetableSlot[]> {
    const params = new URLSearchParams();
    if (department && department !== 'All') params.append('department', department);
    if (year && year !== 'All') params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<TimetableSlot[]>(`/api/timetable${query}`);
  },

  async addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): Promise<TimetableSlot> {
    return request<TimetableSlot>('/api/timetable', {
      method: 'POST',
      body: JSON.stringify(slot)
    });
  },

  // Assignments & Submissions
  async getAssignments(department?: string, year?: string): Promise<Assignment[]> {
    const params = new URLSearchParams();
    if (department && department !== 'All') params.append('department', department);
    if (year && year !== 'All') params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Assignment[]>(`/api/assignments${query}`);
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    return request<Assignment>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment)
    });
  },

  async getSubmissions(studentId: string): Promise<AssignmentSubmission[]> {
    return request<AssignmentSubmission[]>(`/api/submissions/${studentId}`);
  },

  async submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'created_at'>): Promise<AssignmentSubmission> {
    return request<AssignmentSubmission>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submission)
    });
  },

  // Exams & Results
  async getExams(department?: string, year?: string): Promise<Exam[]> {
    const params = new URLSearchParams();
    if (department && department !== 'All') params.append('department', department);
    if (year && year !== 'All') params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Exam[]>(`/api/exams${query}`);
  },

  async createExam(exam: Omit<Exam, 'id' | 'created_at'>): Promise<Exam> {
    return request<Exam>('/api/exams', {
      method: 'POST',
      body: JSON.stringify(exam)
    });
  },

  async getResults(studentId: string): Promise<any[]> {
    return request<any[]>(`/api/results/${studentId}`);
  },

  // Materials, Events, Announcements, Notifications
  async getMaterials(department?: string, year?: string): Promise<StudyMaterial[]> {
    return request<StudyMaterial[]>('/api/materials');
  },

  async getEvents(): Promise<CampusEvent[]> {
    return request<CampusEvent[]>('/api/events');
  },

  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    return request<NotificationItem[]>(`/api/notifications${userId ? `?userId=${userId}` : ''}`);
  }
};
