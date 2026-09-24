-- =========================================================
-- SMART CAMPUS COMPANION - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. PROFILES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'faculty')),
  register_number TEXT,
  department TEXT DEFAULT 'Computer Science & Engineering',
  year TEXT DEFAULT '4th Year',
  section TEXT DEFAULT 'A',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. DEPARTMENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  head_of_dept TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. SUBJECTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  credits INT DEFAULT 3,
  faculty_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 4. ATTENDANCE TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  present_days INT DEFAULT 0,
  total_days INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ---------------------------------------------------------
-- 5. TIMETABLE TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  faculty_name TEXT,
  room TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 6. ASSIGNMENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  description TEXT,
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date TIMESTAMPTZ NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  max_marks INT DEFAULT 100,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 7. ASSIGNMENT SUBMISSIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Graded', 'Overdue')),
  submitted_at TIMESTAMPTZ,
  file_url TEXT,
  submission_text TEXT,
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- ---------------------------------------------------------
-- 8. EXAMS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Internal', 'Model', 'Semester')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  max_marks INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 9. MATERIALS TABLE (STUDY HUB)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('PDF', 'PPT', 'DOCX', 'ZIP', 'LINK')),
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 10. EVENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Workshop', 'Seminar', 'Hackathon', 'Cultural', 'Sports', 'Club', 'Placement')),
  description TEXT,
  event_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  organizer TEXT,
  registration_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 11. ANNOUNCEMENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Important', 'Urgent')),
  department TEXT DEFAULT 'All',
  year TEXT DEFAULT 'All',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 12. NOTIFICATIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means broadcast to all
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('assignment', 'exam', 'attendance', 'announcement', 'material', 'event')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 13. AI CHAT HISTORY TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- REALTIME SUBSCRIPTIONS
-- ---------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.materials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins full profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Attendance Policies
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Admins manage attendance" ON public.attendance FOR ALL USING (public.is_admin());

-- Timetable Policies
CREATE POLICY "Anyone read timetable" ON public.timetable FOR SELECT USING (true);
CREATE POLICY "Admins manage timetable" ON public.timetable FOR ALL USING (public.is_admin());

-- Assignments Policies
CREATE POLICY "Anyone read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Admins manage assignments" ON public.assignments FOR ALL USING (public.is_admin());

-- Assignment Submissions Policies
CREATE POLICY "Students manage own submissions" ON public.assignment_submissions FOR ALL USING (auth.uid() = student_id OR public.is_admin());

-- Exams Policies
CREATE POLICY "Anyone read exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Admins manage exams" ON public.exams FOR ALL USING (public.is_admin());

-- Materials Policies
CREATE POLICY "Anyone read materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Admins manage materials" ON public.materials FOR ALL USING (public.is_admin());

-- Events Policies
CREATE POLICY "Anyone read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events FOR ALL USING (public.is_admin());

-- Announcements Policies
CREATE POLICY "Anyone read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (public.is_admin());

-- Notifications Policies
CREATE POLICY "Users read own or broadcast notifications" ON public.notifications FOR SELECT USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins create notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin());

-- AI Chat History Policies
CREATE POLICY "Students read own AI history" ON public.ai_chat_history FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students create own AI history" ON public.ai_chat_history FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ---------------------------------------------------------
-- TRIGGER FOR USER SIGNUP AUTOMATIC PROFILE CREATION
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, register_number, department, year, section)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'register_number', '21CS' || FLOOR(100 + RANDOM() * 899)::TEXT),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
    COALESCE(NEW.raw_user_meta_data->>'year', '4th Year'),
    COALESCE(NEW.raw_user_meta_data->>'section', 'A')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------
-- SEED DATA SETUP FOR INSTANT PREVIEW & DEMO
-- ---------------------------------------------------------
INSERT INTO public.departments (code, name, head_of_dept) VALUES
  ('CSE', 'Computer Science & Engineering', 'Dr. Aris Thorne'),
  ('ECE', 'Electronics & Communication', 'Dr. Elena Vance'),
  ('IT', 'Information Technology', 'Dr. Marcus Brody')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (code, name, department, year, credits, faculty_name) VALUES
  ('CS8551', 'Database Management Systems', 'Computer Science & Engineering', '4th Year', 4, 'Prof. Alan Turing'),
  ('CS8591', 'Computer Networks', 'Computer Science & Engineering', '4th Year', 3, 'Dr. Radia Perlman'),
  ('CS8601', 'Artificial Intelligence & ML', 'Computer Science & Engineering', '4th Year', 4, 'Prof. Geoffrey Hinton'),
  ('CS8651', 'Operating Systems', 'Computer Science & Engineering', '4th Year', 3, 'Dr. Linus Torvalds'),
  ('CS8691', 'Software Engineering & Agile', 'Computer Science & Engineering', '4th Year', 3, 'Prof. Margaret Hamilton')
ON CONFLICT (code) DO NOTHING;
