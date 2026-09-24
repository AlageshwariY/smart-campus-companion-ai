import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { 
  Profile, 
  Subject, 
  Department, 
  AttendanceRecord, 
  TimetableSlot, 
  Assignment, 
  AssignmentSubmission, 
  Exam, 
  StudyMaterial, 
  CampusEvent, 
  Announcement, 
  NotificationItem 
} from '../types';

export const academicService = {
  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as Profile;
    }
    return dbStore.getProfileById(userId);
  },

  async getAllProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('profiles').select('*');
      if (data) return data as Profile[];
    }
    return dbStore.getProfiles();
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) return data as Profile;
    }
    return dbStore.updateProfile(userId, updates);
  },

  // Attendance
  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('attendance')
        .select('*, subjects(name, code)')
        .eq('student_id', studentId);

      if (data) {
        return data.map(row => ({
          id: row.id,
          student_id: row.student_id,
          subject_id: row.subject_id,
          present_days: row.present_days,
          total_days: row.total_days,
          last_updated: row.last_updated,
          subject_name: row.subjects?.name || 'Subject',
          subject_code: row.subjects?.code || ''
        }));
      }
    }
    return dbStore.getAttendance(studentId);
  },

  async updateAttendance(studentId: string, subjectId: string, presentDays: number, totalDays: number): Promise<AttendanceRecord> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          subject_id: subjectId,
          present_days: presentDays,
          total_days: totalDays,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
      if (!error && data) return data as AttendanceRecord;
    }
    return dbStore.updateAttendance(studentId, subjectId, presentDays, totalDays);
  },

  // Timetable
  async getTimetable(department?: string, year?: string): Promise<TimetableSlot[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('timetable').select('*');
      if (department && department !== 'All') query = query.eq('department', department);
      if (year && year !== 'All') query = query.eq('year', year);
      const { data } = await query;
      if (data) return data as TimetableSlot[];
    }
    return dbStore.getTimetable(department, year);
  },

  async addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): Promise<TimetableSlot> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('timetable').insert(slot).select().single();
      if (!error && data) return data as TimetableSlot;
    }
    return dbStore.addTimetableSlot(slot);
  },

  async deleteTimetableSlot(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('timetable').delete().eq('id', id);
      return;
    }
    dbStore.deleteTimetableSlot(id);
  },

  // Assignments
  async getAssignments(department?: string, year?: string): Promise<Assignment[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('assignments').select('*').order('due_date', { ascending: true });
      if (department && department !== 'All') query = query.eq('department', department);
      if (year && year !== 'All') query = query.eq('year', year);
      const { data } = await query;
      if (data) return data as Assignment[];
    }
    return dbStore.getAssignments(department, year);
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('assignments').insert(assignment).select().single();
      if (!error && data) return data as Assignment;
    }
    return dbStore.addAssignment(assignment);
  },

  async deleteAssignment(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('assignments').delete().eq('id', id);
      return;
    }
    dbStore.deleteAssignment(id);
  },

  // Submissions
  async getSubmissions(studentId: string): Promise<AssignmentSubmission[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('assignment_submissions').select('*').eq('student_id', studentId);
      if (data) return data as AssignmentSubmission[];
    }
    return dbStore.getSubmissions(studentId);
  },

  async submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'created_at'>): Promise<AssignmentSubmission> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('assignment_submissions').upsert({
        ...submission,
        submitted_at: new Date().toISOString()
      }).select().single();
      if (!error && data) return data as AssignmentSubmission;
    }
    return dbStore.submitAssignment(submission);
  },

  // Exams
  async getExams(department?: string, year?: string): Promise<Exam[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('exams').select('*').order('exam_date', { ascending: true });
      if (department && department !== 'All') query = query.eq('department', department);
      if (year && year !== 'All') query = query.eq('year', year);
      const { data } = await query;
      if (data) return data as Exam[];
    }
    return dbStore.getExams(department, year);
  },

  async createExam(exam: Omit<Exam, 'id' | 'created_at'>): Promise<Exam> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('exams').insert(exam).select().single();
      if (!error && data) return data as Exam;
    }
    return dbStore.addExam(exam);
  },

  async deleteExam(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('exams').delete().eq('id', id);
      return;
    }
    dbStore.deleteExam(id);
  },

  // Study Materials
  async getMaterials(department?: string, year?: string): Promise<StudyMaterial[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('materials').select('*').order('created_at', { ascending: false });
      if (department && department !== 'All') query = query.eq('department', department);
      if (year && year !== 'All') query = query.eq('year', year);
      const { data } = await query;
      if (data) return data as StudyMaterial[];
    }
    return dbStore.getMaterials(department, year);
  },

  async createMaterial(material: Omit<StudyMaterial, 'id' | 'created_at'>): Promise<StudyMaterial> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('materials').insert(material).select().single();
      if (!error && data) return data as StudyMaterial;
    }
    return dbStore.addMaterial(material);
  },

  async deleteMaterial(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('materials').delete().eq('id', id);
      return;
    }
    dbStore.deleteMaterial(id);
  },

  // Events
  async getEvents(): Promise<CampusEvent[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      if (data) return data as CampusEvent[];
    }
    return dbStore.getEvents();
  },

  async createEvent(event: Omit<CampusEvent, 'id' | 'created_at'>): Promise<CampusEvent> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('events').insert(event).select().single();
      if (!error && data) return data as CampusEvent;
    }
    return dbStore.addEvent(event);
  },

  async deleteEvent(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('events').delete().eq('id', id);
      return;
    }
    dbStore.deleteEvent(id);
  },

  // Announcements
  async getAnnouncements(department?: string, year?: string): Promise<Announcement[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (department && department !== 'All') query = query.or(`department.eq.${department},department.eq.All`);
      if (year && year !== 'All') query = query.or(`year.eq.${year},year.eq.All`);
      const { data } = await query;
      if (data) return data as Announcement[];
    }
    return dbStore.getAnnouncements(department, year);
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('announcements').insert(announcement).select().single();
      if (!error && data) return data as Announcement;
    }
    return dbStore.addAnnouncement(announcement);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('announcements').delete().eq('id', id);
      return;
    }
    dbStore.deleteAnnouncement(id);
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('notifications')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (data) return data as NotificationItem[];
    }
    return dbStore.getNotifications(userId);
  },

  async markNotificationRead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      return;
    }
    dbStore.markNotificationRead(id);
  },

  async markAllNotificationsRead(userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).or(`user_id.is.null,user_id.eq.${userId}`);
      return;
    }
    dbStore.markAllNotificationsRead(userId);
  },

  // Subjects & Departments
  async getSubjects(): Promise<Subject[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('subjects').select('*');
      if (data) return data as Subject[];
    }
    return dbStore.getSubjects();
  },

  async getDepartments(): Promise<Department[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('departments').select('*');
      if (data) return data as Department[];
    }
    return dbStore.getDepartments();
  }
};
