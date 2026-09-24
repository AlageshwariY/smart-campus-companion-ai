import { 
  Profile, 
  Department, 
  Subject, 
  AttendanceRecord, 
  TimetableSlot, 
  Assignment, 
  AssignmentSubmission, 
  Exam, 
  StudyMaterial, 
  CampusEvent, 
  Announcement, 
  NotificationItem,
  AIChatMessage 
} from '../types';
import { 
  SEED_DEPARTMENTS, 
  SEED_SUBJECTS, 
  SEED_STUDENTS, 
  SEED_ADMIN, 
  SEED_ATTENDANCE, 
  SEED_TIMETABLE, 
  SEED_ASSIGNMENTS, 
  SEED_SUBMISSIONS, 
  SEED_EXAMS, 
  SEED_MATERIALS, 
  SEED_EVENTS, 
  SEED_ANNOUNCEMENTS, 
  SEED_NOTIFICATIONS 
} from './seedData';

const STORAGE_KEYS = {
  PROFILES: 'scc_profiles_v1',
  DEPARTMENTS: 'scc_departments_v1',
  SUBJECTS: 'scc_subjects_v1',
  ATTENDANCE: 'scc_attendance_v1',
  TIMETABLE: 'scc_timetable_v1',
  ASSIGNMENTS: 'scc_assignments_v1',
  SUBMISSIONS: 'scc_submissions_v1',
  EXAMS: 'scc_exams_v1',
  MATERIALS: 'scc_materials_v1',
  EVENTS: 'scc_events_v1',
  ANNOUNCEMENTS: 'scc_announcements_v1',
  NOTIFICATIONS: 'scc_notifications_v1',
  AI_HISTORY: 'scc_ai_history_v1',
  CURRENT_USER: 'scc_current_user_v1'
};

type Listener = (table: string, payload: any) => void;

class LocalDatabaseStore {
  private listeners: Set<Listener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.initSeedData();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('smart_campus_realtime');
      this.broadcastChannel.onmessage = (event) => {
        const { table, payload } = event.data;
        this.notifyListeners(table, payload);
      };
    }
  }

  private initSeedData() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      const initialProfiles = [...SEED_STUDENTS, SEED_ADMIN];
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(initialProfiles));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(SEED_DEPARTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(SEED_SUBJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIMETABLE)) {
      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(SEED_TIMETABLE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(SEED_ASSIGNMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(SEED_SUBMISSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(SEED_EXAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SEED_MATERIALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AI_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify([]));
    }
  }

  // Subscribe to real-time table mutations
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(table: string, payload: any) {
    this.listeners.forEach(fn => fn(table, payload));
  }

  private saveAndBroadcast(key: string, table: string, data: any, eventType: 'INSERT' | 'UPDATE' | 'DELETE', payloadData: any) {
    localStorage.setItem(key, JSON.stringify(data));
    const broadcastPayload = { eventType, new: payloadData, table };
    this.notifyListeners(table, broadcastPayload);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ table, payload: broadcastPayload });
    }
  }

  // Helper getters
  public getItem<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  // Profiles
  public getProfiles(): Profile[] {
    return this.getItem<Profile>(STORAGE_KEYS.PROFILES);
  }

  public getProfileById(id: string): Profile | null {
    return this.getProfiles().find(p => p.id === id) || null;
  }

  public updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveAndBroadcast(STORAGE_KEYS.PROFILES, 'profiles', profiles, 'UPDATE', profiles[idx]);
    return profiles[idx];
  }

  // Attendance
  public getAttendance(studentId: string): AttendanceRecord[] {
    const records = this.getItem<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE);
    const subjects = this.getSubjects();
    return records
      .filter(r => r.student_id === studentId)
      .map(r => {
        const subj = subjects.find(s => s.id === r.subject_id);
        return {
          ...r,
          subject_name: subj?.name || 'Unknown Subject',
          subject_code: subj?.code || 'N/A'
        };
      });
  }

  public updateAttendance(studentId: string, subjectId: string, presentDays: number, totalDays: number): AttendanceRecord {
    const records = this.getItem<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE);
    const idx = records.findIndex(r => r.student_id === studentId && r.subject_id === subjectId);
    let updatedRecord: AttendanceRecord;

    if (idx !== -1) {
      records[idx] = {
        ...records[idx],
        present_days: presentDays,
        total_days: totalDays,
        last_updated: new Date().toISOString()
      };
      updatedRecord = records[idx];
    } else {
      updatedRecord = {
        id: 'att-' + Date.now(),
        student_id: studentId,
        subject_id: subjectId,
        present_days: presentDays,
        total_days: totalDays,
        last_updated: new Date().toISOString()
      };
      records.push(updatedRecord);
    }

    this.saveAndBroadcast(STORAGE_KEYS.ATTENDANCE, 'attendance', records, idx !== -1 ? 'UPDATE' : 'INSERT', updatedRecord);

    // Also push a notification to the student!
    const subject = this.getSubjects().find(s => s.id === subjectId);
    this.createNotification({
      user_id: studentId,
      title: 'Attendance Updated',
      message: `Your attendance in ${subject?.name || 'Subject'} was updated to ${presentDays}/${totalDays} days (${Math.round((presentDays / (totalDays || 1)) * 100)}%).`,
      type: 'attendance',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return updatedRecord;
  }

  // Timetable
  public getTimetable(department?: string, year?: string): TimetableSlot[] {
    let slots = this.getItem<TimetableSlot>(STORAGE_KEYS.TIMETABLE);
    if (department && department !== 'All') {
      slots = slots.filter(s => s.department === department);
    }
    if (year && year !== 'All') {
      slots = slots.filter(s => s.year === year);
    }
    return slots;
  }

  public addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): TimetableSlot {
    const slots = this.getItem<TimetableSlot>(STORAGE_KEYS.TIMETABLE);
    const newSlot: TimetableSlot = { ...slot, id: 'tt-' + Date.now() };
    slots.push(newSlot);
    this.saveAndBroadcast(STORAGE_KEYS.TIMETABLE, 'timetable', slots, 'INSERT', newSlot);
    return newSlot;
  }

  public deleteTimetableSlot(id: string) {
    let slots = this.getItem<TimetableSlot>(STORAGE_KEYS.TIMETABLE);
    slots = slots.filter(s => s.id !== id);
    this.saveAndBroadcast(STORAGE_KEYS.TIMETABLE, 'timetable', slots, 'DELETE', { id });
  }

  // Assignments
  public getAssignments(department?: string, year?: string): Assignment[] {
    let assignments = this.getItem<Assignment>(STORAGE_KEYS.ASSIGNMENTS);
    if (department && department !== 'All') {
      assignments = assignments.filter(a => a.department === department || a.department === 'All');
    }
    if (year && year !== 'All') {
      assignments = assignments.filter(a => a.year === year || a.year === 'All');
    }
    return assignments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  public addAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Assignment {
    const assignments = this.getItem<Assignment>(STORAGE_KEYS.ASSIGNMENTS);
    const newAssignment: Assignment = {
      ...assignment,
      id: 'asg-' + Date.now(),
      created_at: new Date().toISOString()
    };
    assignments.push(newAssignment);
    this.saveAndBroadcast(STORAGE_KEYS.ASSIGNMENTS, 'assignments', assignments, 'INSERT', newAssignment);

    // Notify all students
    this.createNotification({
      title: 'New Assignment Posted',
      message: `Assignment: "${newAssignment.title}" due on ${new Date(newAssignment.due_date).toLocaleDateString()}.`,
      type: 'assignment',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return newAssignment;
  }

  public deleteAssignment(id: string) {
    let assignments = this.getItem<Assignment>(STORAGE_KEYS.ASSIGNMENTS);
    assignments = assignments.filter(a => a.id !== id);
    this.saveAndBroadcast(STORAGE_KEYS.ASSIGNMENTS, 'assignments', assignments, 'DELETE', { id });
  }

  // Submissions
  public getSubmissions(studentId: string): AssignmentSubmission[] {
    const submissions = this.getItem<AssignmentSubmission>(STORAGE_KEYS.SUBMISSIONS);
    return submissions.filter(s => s.student_id === studentId);
  }

  public submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'created_at'>): AssignmentSubmission {
    const submissions = this.getItem<AssignmentSubmission>(STORAGE_KEYS.SUBMISSIONS);
    const idx = submissions.findIndex(s => s.assignment_id === submission.assignment_id && s.student_id === submission.student_id);
    let result: AssignmentSubmission;
    if (idx !== -1) {
      submissions[idx] = {
        ...submissions[idx],
        ...submission,
        submitted_at: new Date().toISOString()
      };
      result = submissions[idx];
    } else {
      result = {
        ...submission,
        id: 'sub-' + Date.now(),
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      submissions.push(result);
    }
    this.saveAndBroadcast(STORAGE_KEYS.SUBMISSIONS, 'assignment_submissions', submissions, idx !== -1 ? 'UPDATE' : 'INSERT', result);
    return result;
  }

  // Exams
  public getExams(department?: string, year?: string): Exam[] {
    let exams = this.getItem<Exam>(STORAGE_KEYS.EXAMS);
    if (department && department !== 'All') {
      exams = exams.filter(e => e.department === department || e.department === 'All');
    }
    if (year && year !== 'All') {
      exams = exams.filter(e => e.year === year || e.year === 'All');
    }
    return exams.sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
  }

  public addExam(exam: Omit<Exam, 'id' | 'created_at'>): Exam {
    const exams = this.getItem<Exam>(STORAGE_KEYS.EXAMS);
    const newExam: Exam = {
      ...exam,
      id: 'exam-' + Date.now(),
      created_at: new Date().toISOString()
    };
    exams.push(newExam);
    this.saveAndBroadcast(STORAGE_KEYS.EXAMS, 'exams', exams, 'INSERT', newExam);

    this.createNotification({
      title: 'New Exam Scheduled',
      message: `${newExam.category} Exam: "${newExam.title}" on ${newExam.exam_date} at ${newExam.start_time}.`,
      type: 'exam',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return newExam;
  }

  public deleteExam(id: string) {
    let exams = this.getItem<Exam>(STORAGE_KEYS.EXAMS);
    exams = exams.filter(e => e.id !== id);
    this.saveAndBroadcast(STORAGE_KEYS.EXAMS, 'exams', exams, 'DELETE', { id });
  }

  // Study Materials
  public getMaterials(department?: string, year?: string): StudyMaterial[] {
    let materials = this.getItem<StudyMaterial>(STORAGE_KEYS.MATERIALS);
    if (department && department !== 'All') {
      materials = materials.filter(m => m.department === department || m.department === 'All');
    }
    if (year && year !== 'All') {
      materials = materials.filter(m => m.year === year || m.year === 'All');
    }
    return materials;
  }

  public addMaterial(material: Omit<StudyMaterial, 'id' | 'created_at'>): StudyMaterial {
    const materials = this.getItem<StudyMaterial>(STORAGE_KEYS.MATERIALS);
    const newMaterial: StudyMaterial = {
      ...material,
      id: 'mat-' + Date.now(),
      created_at: new Date().toISOString()
    };
    materials.push(newMaterial);
    this.saveAndBroadcast(STORAGE_KEYS.MATERIALS, 'materials', materials, 'INSERT', newMaterial);

    this.createNotification({
      title: 'New Study Material Uploaded',
      message: `New resource uploaded for ${newMaterial.subject_name}: "${newMaterial.title}".`,
      type: 'material',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return newMaterial;
  }

  public deleteMaterial(id: string) {
    let materials = this.getItem<StudyMaterial>(STORAGE_KEYS.MATERIALS);
    materials = materials.filter(m => m.id !== id);
    this.saveAndBroadcast(STORAGE_KEYS.MATERIALS, 'materials', materials, 'DELETE', { id });
  }

  // Events
  public getEvents(): CampusEvent[] {
    const events = this.getItem<CampusEvent>(STORAGE_KEYS.EVENTS);
    return events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  public addEvent(event: Omit<CampusEvent, 'id' | 'created_at'>): CampusEvent {
    const events = this.getItem<CampusEvent>(STORAGE_KEYS.EVENTS);
    const newEvent: CampusEvent = {
      ...event,
      id: 'evt-' + Date.now(),
      created_at: new Date().toISOString()
    };
    events.push(newEvent);
    this.saveAndBroadcast(STORAGE_KEYS.EVENTS, 'events', events, 'INSERT', newEvent);

    this.createNotification({
      title: 'New Campus Event',
      message: `Upcoming ${newEvent.category}: "${newEvent.title}" on ${newEvent.event_date}.`,
      type: 'event',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return newEvent;
  }

  public deleteEvent(id: string) {
    let events = this.getItem<CampusEvent>(STORAGE_KEYS.EVENTS);
    events = events.filter(e => e.id !== id);
    this.saveAndBroadcast(STORAGE_KEYS.EVENTS, 'events', events, 'DELETE', { id });
  }

  // Announcements
  public getAnnouncements(department?: string, year?: string): Announcement[] {
    let announcements = this.getItem<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS);
    if (department && department !== 'All') {
      announcements = announcements.filter(a => a.department === department || a.department === 'All');
    }
    if (year && year !== 'All') {
      announcements = announcements.filter(a => a.year === year || a.year === 'All');
    }
    return announcements.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  }

  public addAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Announcement {
    const announcements = this.getItem<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS);
    const newAnnouncement: Announcement = {
      ...announcement,
      id: 'ann-' + Date.now(),
      created_at: new Date().toISOString()
    };
    announcements.push(newAnnouncement);
    this.saveAndBroadcast(STORAGE_KEYS.ANNOUNCEMENTS, 'announcements', announcements, 'INSERT', newAnnouncement);

    this.createNotification({
      title: `${newAnnouncement.priority === 'Urgent' ? 'URGENT: ' : ''}${newAnnouncement.title}`,
      message: newAnnouncement.description.substring(0, 100) + '...',
      type: 'announcement',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return newAnnouncement;
  }

  public deleteAnnouncement(id: string) {
    let announcements = this.getItem<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS);
    announcements = announcements.filter(a => a.id !== id);
    this.saveAndBroadcast(STORAGE_KEYS.ANNOUNCEMENTS, 'announcements', announcements, 'DELETE', { id });
  }

  // Notifications
  public getNotifications(userId?: string): NotificationItem[] {
    const notifications = this.getItem<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS);
    return notifications.filter(n => !n.user_id || n.user_id === userId);
  }

  public createNotification(notif: Omit<NotificationItem, 'id'>): NotificationItem {
    const notifications = this.getItem<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS);
    const newNotif: NotificationItem = { ...notif, id: 'notif-' + Date.now() };
    notifications.unshift(newNotif);
    this.saveAndBroadcast(STORAGE_KEYS.NOTIFICATIONS, 'notifications', notifications, 'INSERT', newNotif);
    return newNotif;
  }

  public markNotificationRead(id: string) {
    const notifications = this.getItem<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS);
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].is_read = true;
      this.saveAndBroadcast(STORAGE_KEYS.NOTIFICATIONS, 'notifications', notifications, 'UPDATE', notifications[idx]);
    }
  }

  public markAllNotificationsRead(userId?: string) {
    const notifications = this.getItem<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS);
    notifications.forEach(n => {
      if (!n.user_id || n.user_id === userId) {
        n.is_read = true;
      }
    });
    this.saveAndBroadcast(STORAGE_KEYS.NOTIFICATIONS, 'notifications', notifications, 'UPDATE', { allRead: true });
  }

  // Subjects & Departments
  public getSubjects(): Subject[] {
    return this.getItem<Subject>(STORAGE_KEYS.SUBJECTS);
  }

  public getDepartments(): Department[] {
    return this.getItem<Department>(STORAGE_KEYS.DEPARTMENTS);
  }

  // AI Chat History
  public getAIChatHistory(studentId: string): AIChatMessage[] {
    const history = this.getItem<AIChatMessage>(STORAGE_KEYS.AI_HISTORY);
    return history.filter(h => h.student_id === studentId);
  }

  public saveAIChatMessage(msg: Omit<AIChatMessage, 'id' | 'created_at'>): AIChatMessage {
    const history = this.getItem<AIChatMessage>(STORAGE_KEYS.AI_HISTORY);
    const newMsg: AIChatMessage = {
      ...msg,
      id: 'ai-msg-' + Date.now(),
      created_at: new Date().toISOString()
    };
    history.push(newMsg);
    this.saveAndBroadcast(STORAGE_KEYS.AI_HISTORY, 'ai_chat_history', history, 'INSERT', newMsg);
    return newMsg;
  }
}

export const dbStore = new LocalDatabaseStore();
