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
  NotificationItem 
} from '../types';

export const SEED_DEPARTMENTS: Department[] = [
  { id: 'dept-1', code: 'CSE', name: 'Computer Science & Engineering', head_of_dept: 'Dr. Aris Thorne' },
  { id: 'dept-2', code: 'ECE', name: 'Electronics & Communication', head_of_dept: 'Dr. Elena Vance' },
  { id: 'dept-3', code: 'IT', name: 'Information Technology', head_of_dept: 'Dr. Marcus Brody' }
];

export const SEED_SUBJECTS: Subject[] = [
  { id: 'subj-1', code: 'CS8551', name: 'Database Management Systems', department: 'Computer Science & Engineering', year: '4th Year', credits: 4, faculty_name: 'Prof. Alan Turing' },
  { id: 'subj-2', code: 'CS8591', name: 'Computer Networks', department: 'Computer Science & Engineering', year: '4th Year', credits: 3, faculty_name: 'Dr. Radia Perlman' },
  { id: 'subj-3', code: 'CS8601', name: 'Artificial Intelligence & ML', department: 'Computer Science & Engineering', year: '4th Year', credits: 4, faculty_name: 'Prof. Geoffrey Hinton' },
  { id: 'subj-4', code: 'CS8651', name: 'Operating Systems', department: 'Computer Science & Engineering', year: '4th Year', credits: 3, faculty_name: 'Dr. Linus Torvalds' },
  { id: 'subj-5', code: 'CS8691', name: 'Software Engineering & Agile', department: 'Computer Science & Engineering', year: '4th Year', credits: 3, faculty_name: 'Prof. Margaret Hamilton' }
];

export const SEED_STUDENTS: Profile[] = [
  {
    id: 'student-demo-uuid-1',
    email: 'alex.student@campus.edu',
    full_name: 'Alex Rivera',
    role: 'student',
    register_number: '21CS042',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    section: 'A',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    phone: '+1 555-0192'
  },
  {
    id: 'student-demo-uuid-2',
    email: 'sarah.student@campus.edu',
    full_name: 'Sarah Chen',
    role: 'student',
    register_number: '21CS088',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    section: 'B',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    phone: '+1 555-0193'
  }
];

export const SEED_ADMIN: Profile = {
  id: 'admin-demo-uuid-1',
  email: 'admin@campus.edu',
  full_name: 'Dean Robert Harrison',
  role: 'admin',
  department: 'Computer Science & Engineering',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
  phone: '+1 555-0100'
};

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', student_id: 'student-demo-uuid-1', subject_id: 'subj-1', present_days: 28, total_days: 30, last_updated: new Date().toISOString() }, // 93.3%
  { id: 'att-2', student_id: 'student-demo-uuid-1', subject_id: 'subj-2', present_days: 21, total_days: 30, last_updated: new Date().toISOString() }, // 70% (Warning)
  { id: 'att-3', student_id: 'student-demo-uuid-1', subject_id: 'subj-3', present_days: 26, total_days: 30, last_updated: new Date().toISOString() }, // 86.6%
  { id: 'att-4', student_id: 'student-demo-uuid-1', subject_id: 'subj-4', present_days: 29, total_days: 30, last_updated: new Date().toISOString() }, // 96.6%
  { id: 'att-5', student_id: 'student-demo-uuid-1', subject_id: 'subj-5', present_days: 24, total_days: 30, last_updated: new Date().toISOString() }  // 80%
];

export const SEED_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'tt-1', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Monday', start_time: '09:00 AM', end_time: '10:00 AM', subject_id: 'subj-1', subject_name: 'Database Management Systems', faculty_name: 'Prof. Alan Turing', room: 'Lab 201' },
  { id: 'tt-2', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Monday', start_time: '10:00 AM', end_time: '11:00 AM', subject_id: 'subj-2', subject_name: 'Computer Networks', faculty_name: 'Dr. Radia Perlman', room: 'Hall B3' },
  { id: 'tt-3', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Monday', start_time: '11:15 AM', end_time: '12:15 PM', subject_id: 'subj-3', subject_name: 'Artificial Intelligence & ML', faculty_name: 'Prof. Geoffrey Hinton', room: 'Lab 402' },
  
  // Tuesday
  { id: 'tt-4', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Tuesday', start_time: '09:00 AM', end_time: '10:00 AM', subject_id: 'subj-4', subject_name: 'Operating Systems', faculty_name: 'Dr. Linus Torvalds', room: 'Hall A1' },
  { id: 'tt-5', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Tuesday', start_time: '10:00 AM', end_time: '11:00 AM', subject_id: 'subj-5', subject_name: 'Software Engineering & Agile', faculty_name: 'Prof. Margaret Hamilton', room: 'Hall A1' },

  // Wednesday
  { id: 'tt-6', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Wednesday', start_time: '09:00 AM', end_time: '11:00 AM', subject_id: 'subj-1', subject_name: 'DBMS Lab Session', faculty_name: 'Prof. Alan Turing', room: 'DBMS Lab 1' },
  { id: 'tt-7', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Wednesday', start_time: '01:30 PM', end_time: '03:30 PM', subject_id: 'subj-3', subject_name: 'AI Workshop', faculty_name: 'Prof. Geoffrey Hinton', room: 'Innovation Lab' },

  // Thursday
  { id: 'tt-8', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Thursday', start_time: '09:00 AM', end_time: '10:00 AM', subject_id: 'subj-2', subject_name: 'Computer Networks', faculty_name: 'Dr. Radia Perlman', room: 'Hall B3' },
  { id: 'tt-9', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Thursday', start_time: '10:00 AM', end_time: '11:00 AM', subject_id: 'subj-4', subject_name: 'Operating Systems', faculty_name: 'Dr. Linus Torvalds', room: 'Hall A1' },

  // Friday
  { id: 'tt-10', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Friday', start_time: '09:00 AM', end_time: '10:00 AM', subject_id: 'subj-5', subject_name: 'Software Engineering & Agile', faculty_name: 'Prof. Margaret Hamilton', room: 'Hall B3' },
  { id: 'tt-11', department: 'Computer Science & Engineering', year: '4th Year', day_of_week: 'Friday', start_time: '11:00 AM', end_time: '12:00 PM', subject_id: 'subj-1', subject_name: 'Database Management Systems', faculty_name: 'Prof. Alan Turing', room: 'Hall B3' }
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'B-Tree & B+ Tree Indexing Implementation',
    subject_id: 'subj-1',
    subject_name: 'Database Management Systems',
    description: 'Implement a working B-Tree indexing mechanism in C++ or Python with benchmark tests.',
    assigned_date: '2026-09-20',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(), // 2 days from now
    department: 'Computer Science & Engineering',
    year: '4th Year',
    max_marks: 100
  },
  {
    id: 'asg-2',
    title: 'TCP/IP Socket Chat Server',
    subject_id: 'subj-2',
    subject_name: 'Computer Networks',
    description: 'Build a multi-threaded chat application using TCP sockets in C or Python.',
    assigned_date: '2026-09-18',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days from now
    department: 'Computer Science & Engineering',
    year: '4th Year',
    max_marks: 100
  },
  {
    id: 'asg-3',
    title: 'Convolutional Neural Network Classifier',
    subject_id: 'subj-3',
    subject_name: 'Artificial Intelligence & ML',
    description: 'Train a CNN model on the MNIST/CIFAR-10 dataset using PyTorch or TensorFlow.',
    assigned_date: '2026-09-22',
    due_date: new Date(Date.now() + 8 * 86400000).toISOString(), // 8 days from now
    department: 'Computer Science & Engineering',
    year: '4th Year',
    max_marks: 100
  }
];

export const SEED_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignment_id: 'asg-1',
    student_id: 'student-demo-uuid-1',
    status: 'Pending',
    created_at: new Date().toISOString()
  }
];

export const SEED_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'DBMS Mid-Semester Exam',
    category: 'Internal',
    subject_id: 'subj-1',
    subject_name: 'Database Management Systems',
    exam_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 days from now
    start_time: '10:00 AM',
    end_time: '01:00 PM',
    room: 'Exam Hall 302',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    max_marks: 50
  },
  {
    id: 'exam-2',
    title: 'Computer Networks Practical Exam',
    category: 'Internal',
    subject_id: 'subj-2',
    subject_name: 'Computer Networks',
    exam_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    start_time: '09:00 AM',
    end_time: '12:00 PM',
    room: 'Network Lab 1',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    max_marks: 50
  },
  {
    id: 'exam-3',
    title: 'Final Semester Comprehensive Exam',
    category: 'Semester',
    subject_id: 'subj-3',
    subject_name: 'Artificial Intelligence & ML',
    exam_date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '01:00 PM',
    room: 'Main Auditorium',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    max_marks: 100
  }
];

export const SEED_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Database Normalization Complete Guide (1NF to 5NF)',
    subject_id: 'subj-1',
    subject_name: 'Database Management Systems',
    description: 'Comprehensive slides covering Functional Dependencies, 3NF, BCNF and 4NF with solved examples.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'PDF',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    created_at: new Date().toISOString()
  },
  {
    id: 'mat-2',
    title: 'TCP vs UDP Protocols Handout',
    subject_id: 'subj-2',
    subject_name: 'Computer Networks',
    description: 'Detailed comparison chart of Transport Layer protocols and congestion control.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'PDF',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    created_at: new Date().toISOString()
  },
  {
    id: 'mat-3',
    title: 'Neural Networks Architecture & Backpropagation PPT',
    subject_id: 'subj-3',
    subject_name: 'Artificial Intelligence & ML',
    description: 'Lecture slides on Gradient Descent, Activation Functions, and loss optimization.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'PPT',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    created_at: new Date().toISOString()
  }
];

export const SEED_EVENTS: CampusEvent[] = [
  {
    id: 'evt-1',
    title: 'Smart Campus Hackathon 2026',
    category: 'Hackathon',
    description: '36-hour continuous build hackathon for AI & Web3 applications with $5,000 in prizes!',
    event_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    start_time: '09:00 AM',
    end_time: '09:00 PM',
    venue: 'Tech Innovation Hub',
    organizer: 'CSE Tech Society',
    registration_link: 'https://campus-hackathon.example.com',
    created_at: new Date().toISOString()
  },
  {
    id: 'evt-2',
    title: 'Google & Microsoft Campus Placement Drive',
    category: 'Placement',
    description: 'Pre-placement talk and coding screening for Final Year CSE/IT students.',
    event_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '04:00 PM',
    venue: 'Main Auditorium',
    organizer: 'Campus Placement Cell',
    created_at: new Date().toISOString()
  },
  {
    id: 'evt-3',
    title: 'Generative AI Masterclass Seminar',
    category: 'Seminar',
    description: 'Interactive session on LLM Agent architectures and Transformer models by industry leads.',
    event_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    start_time: '02:00 PM',
    end_time: '05:00 PM',
    venue: 'Seminar Hall 1',
    organizer: 'AI Research Group',
    created_at: new Date().toISOString()
  }
];

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Mid-Semester Exam Schedule Released',
    description: 'The internal examination timetable for 4th Year CSE has been finalized. Check the Exam Center for full room assignments.',
    priority: 'Urgent',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'ann-2',
    title: 'Campus Library Extended Evening Hours',
    description: 'The Central Digital Library will remain open until 11:00 PM during exam weeks.',
    priority: 'Important',
    department: 'All',
    year: 'All',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'ann-3',
    title: 'Final Year Major Project Submission Guidelines',
    description: 'Please submit your major project documentation draft to your respective faculty mentors by the end of this week.',
    priority: 'Normal',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'student-demo-uuid-1',
    title: 'New Assignment Added',
    message: 'Prof. Alan Turing published B-Tree & B+ Tree Indexing due in 2 days.',
    type: 'assignment',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'student-demo-uuid-1',
    title: 'Exam Date Confirmed',
    message: 'DBMS Mid-Semester Exam scheduled for 10:00 AM in Exam Hall 302.',
    type: 'exam',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'student-demo-uuid-1',
    title: 'Urgent Announcement',
    message: 'Mid-Semester Exam Schedule Released for 4th Year CSE.',
    type: 'announcement',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];
