// User Roles
export type UserRole = 'student' | 'admin' | 'faculty';

// User Profile
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  register_number?: string;
  department?: string;
  year?: string;
  section?: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

// Department
export interface Department {
  id: string;
  code: string;
  name: string;
  head_of_dept?: string;
  created_at?: string;
}

// Subject
export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  year: string;
  credits: number;
  faculty_name?: string;
  created_at?: string;
}

// Attendance Record
export interface AttendanceRecord {
  id: string;
  student_id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  present_days: number;
  total_days: number;
  last_updated?: string;
}

// Timetable Slot
export interface TimetableSlot {
  id: string;
  department: string;
  year: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  subject_id: string;
  subject_name: string;
  faculty_name?: string;
  room: string;
  created_at?: string;
}

// Assignment
export interface Assignment {
  id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  description: string;
  assigned_date: string;
  due_date: string;
  department: string;
  year: string;
  max_marks: number;
  created_by?: string;
  created_at?: string;
}

// Assignment Submission
export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue';
  submitted_at?: string;
  file_url?: string;
  submission_text?: string;
  grade?: string;
  remarks?: string;
  created_at?: string;
}

// Exam
export type ExamCategory = 'Internal' | 'Model' | 'Semester';

export interface Exam {
  id: string;
  title: string;
  category: ExamCategory;
  subject_id: string;
  subject_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room: string;
  department: string;
  year: string;
  max_marks: number;
  created_at?: string;
}

// Study Material
export type MaterialFileType = 'PDF' | 'PPT' | 'DOCX' | 'ZIP' | 'LINK';

export interface StudyMaterial {
  id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  description: string;
  file_url: string;
  file_type: MaterialFileType;
  department: string;
  year: string;
  uploaded_by?: string;
  created_at?: string;
}

// Event
export type EventCategory = 'Workshop' | 'Seminar' | 'Hackathon' | 'Cultural' | 'Sports' | 'Club' | 'Placement';

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  organizer?: string;
  registration_link?: string;
  created_at?: string;
}

// Announcement
export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: AnnouncementPriority;
  department: string;
  year: string;
  created_by?: string;
  created_at?: string;
}

// Notification
export type NotificationType = 'assignment' | 'exam' | 'attendance' | 'announcement' | 'material' | 'event';

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string;
  created_at: string;
}

// AI Message
export interface AIChatMessage {
  id: string;
  student_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}
