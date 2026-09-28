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

export const SEED_CAMPUS_DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'Academic Regulations & Examination Policy 2025-2026',
    category: 'Regulation',
    department: 'All',
    content: `INSTITUTION ACADEMIC & ATTENDANCE REGULATIONS:
1. Minimum Attendance: Students must maintain a minimum of 75% attendance in each course to be eligible for end-semester examinations. Students with attendance between 65% and 74% due to medical reasons must submit a verified medical certificate for condonation.
2. Internal Assessment: Internal exams carry 40% weightage of the final course grade. Mid-semester exams are compulsory.
3. Assignment Submissions: Assignments submitted past the due date will suffer a 10% grade penalty per day unless prior extension is approved by the course faculty.
4. Hall Ticket Rules: Students must present their physical or digital smart ID card at the exam hall. Electronic gadgets except approved non-programmable calculators are strictly prohibited.`
  },
  {
    id: 'doc-2',
    title: 'Computer Science & Engineering Syllabus Handbook (Semester 7 & 8)',
    category: 'Syllabus',
    department: 'Computer Science & Engineering',
    content: `CSE CURRICULUM SYLLABUS HIGHLIGHTS:
1. CS8551 Database Management Systems: Relational Algebra, SQL Queries, ER Modeling, Normalization (1NF to 5NF, BCNF), Transaction Processing, ACID properties, Concurrency Control, Locking Protocols, B-Trees and B+ Trees.
2. CS8591 Computer Networks: OSI 7-Layer Architecture, TCP/IP, IP Addressing & Subnetting, Routing Algorithms (OSPF, BGP), TCP Flow & Congestion Control, DNS, HTTP/HTTPS.
3. CS8601 Artificial Intelligence & ML: Uninformed Search (BFS, DFS), Informed Search (A*), Knowledge Representation, Machine Learning Models (Linear Regression, SVM, Decision Trees, CNNs), Transformers & Generative AI.
4. CS8651 Operating Systems: Process Synchronization, Semaphores, Deadlock Handling (Banker's Algorithm), Memory Virtualization, Page Replacement (LRU, FIFO), File Systems.`
  },
  {
    id: 'doc-3',
    title: 'Campus Placement & Career Development Guidelines 2026',
    category: 'Placement',
    department: 'All',
    content: `CAMPUS PLACEMENT POLICY:
1. Eligibility: Students with CGPA >= 7.0 and no active backlogs are eligible for Tier-1 technology companies (Google, Microsoft, Amazon, TCS Digital).
2. Preparation Milestones: Students must complete a minimum of 150 Data Structures & Algorithms coding challenges, build 2 full-stack/AI capstone projects, and undergo 2 mock interviews.
3. Resume Standards: Resumes must adhere to the standard single-page ATS-friendly template provided by the Placement Cell. Quantifiable metrics must be highlighted in project descriptions.`
  },
  {
    id: 'doc-4',
    title: 'Student Handbook & Campus Facilities Directory',
    category: 'Handbook',
    department: 'All',
    content: `CAMPUS LOCATIONS & INFRASTRUCTURE GUIDE:
1. Central Library: Located in Block A, 2nd Floor. Open Monday to Saturday 8:00 AM - 10:00 PM. Digital catalog access terminal available.
2. Computer Science Labs: Advanced AI Lab (Room 402, Block C), DBMS Lab (Room 201, Block C), Network Security Lab (Room 305, Block C).
3. Student Helpdesk: Located at Main Administration Block, Counter 4. Email: helpdesk@campus.edu.
4. Campus Transport Shuttle: Departs every 30 minutes from Main Gate to Metro Station between 7:30 AM and 7:00 PM.`
  }
];

export const SEED_FACULTY = [
  {
    id: 'fac-1',
    name: 'Prof. Alan Turing',
    department: 'Computer Science & Engineering',
    designation: 'Professor & HOD (DB Research)',
    email: 'turing@campus.edu',
    phone: '+1 555-0111',
    office_location: 'Block C, Room 301',
    consultation_hours: 'Mon & Wed 2:00 PM - 4:00 PM'
  },
  {
    id: 'fac-2',
    name: 'Dr. Radia Perlman',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    email: 'perlman@campus.edu',
    phone: '+1 555-0112',
    office_location: 'Block C, Room 304',
    consultation_hours: 'Tue & Thu 11:00 AM - 1:00 PM'
  },
  {
    id: 'fac-3',
    name: 'Prof. Geoffrey Hinton',
    department: 'Computer Science & Engineering',
    designation: 'Distinguished Professor (AI)',
    email: 'hinton@campus.edu',
    phone: '+1 555-0113',
    office_location: 'Block C, Room 405',
    consultation_hours: 'Friday 10:00 AM - 12:00 PM'
  },
  {
    id: 'fac-4',
    name: 'Dr. Linus Torvalds',
    department: 'Computer Science & Engineering',
    designation: 'Senior Systems Professor',
    email: 'linus@campus.edu',
    phone: '+1 555-0114',
    office_location: 'Block C, Room 202',
    consultation_hours: 'Wed 10:00 AM - 12:00 PM'
  }
];

export const SEED_LOCATIONS = [
  { id: 'loc-1', name: 'Central Digital Library', category: 'Library', building: 'Block A', floor: '2nd Floor', description: 'Quiet study zones, 50,000+ books, digital terminals & high-speed Wi-Fi.' },
  { id: 'loc-2', name: 'Advanced AI & Data Science Lab', category: 'Lab', building: 'Block C', floor: '4th Floor (Room 402)', description: 'NVIDIA GPU workstations for Deep Learning & Computer Vision workloads.' },
  { id: 'loc-3', name: 'DBMS & Software Engineering Lab', category: 'Lab', building: 'Block C', floor: '2nd Floor (Room 201)', description: 'Database servers, PostgreSQL setup, Agile project review pods.' },
  { id: 'loc-4', name: 'Main Campus Auditorium', category: 'Auditorium', building: 'Block B', floor: 'Ground Floor', description: '1,200 capacity air-conditioned hall for placement drives & hackathons.' },
  { id: 'loc-5', name: 'Student Food Court & Canteen', category: 'Canteen', building: 'Central Plaza', floor: 'Ground Floor', description: 'Multi-cuisine food vendors, seating for 500, cashless digital payment.' }
];

export const SEED_LOST_FOUND = [
  { id: 'lf-1', item_name: 'Blue Dell Laptop Charger', category: 'Electronics', found_location: 'Lab 201, Block C', date_found: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'Unclaimed', contact_person: 'Admin Security Desk' },
  { id: 'lf-2', item_name: 'Casio Scientific Calculator FX-991EX', category: 'Stationery', found_location: 'Exam Hall 302', date_found: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], status: 'Unclaimed', contact_person: 'Exam Controller Office' }
];

export const SEED_SHUTTLE_ROUTES = [
  { id: 'shut-1', route_name: 'Metro Express Line 1', start_point: 'Main Gate', end_point: 'Central Metro Station', timings: ['07:30 AM', '08:15 AM', '09:00 AM', '05:15 PM', '06:00 PM'], stops: ['Main Gate', 'Library Square', 'Hostel Block', 'Metro Station'] },
  { id: 'shut-2', route_name: 'Hostel Shuttle Line 2', start_point: 'Hostel Complex', end_point: 'Academic Block C', timings: ['08:30 AM', '08:50 AM', '01:15 PM', '05:00 PM'], stops: ['Boys Hostel', 'Girls Hostel', 'Food Court', 'Block C'] }
];

export const SEED_INSTITUTION_SETTINGS = {
  min_attendance_pct: 75,
  institution_name: 'Smart Campus AI Institute of Technology',
  academic_year: '2025-2026'
};

