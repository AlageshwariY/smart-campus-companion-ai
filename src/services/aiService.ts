import { academicService } from './academicService';
import { dbStore } from './dbStore';
import { Profile, AIChatMessage } from '../types';

export const aiService = {
  /**
   * Generates a context-aware response based on the student's exact real database records.
   */
  async askAssistant(student: Profile, query: string, conversationId: string): Promise<string> {
    const qLower = query.toLowerCase();

    // Fetch student database state
    const attendance = await academicService.getStudentAttendance(student.id);
    const assignments = await academicService.getAssignments(student.department, student.year);
    const submissions = await academicService.getSubmissions(student.id);
    const exams = await academicService.getExams(student.department, student.year);
    const timetable = await academicService.getTimetable(student.department, student.year);
    const announcements = await academicService.getAnnouncements(student.department, student.year);
    const materials = await academicService.getMaterials(student.department, student.year);
    const events = await academicService.getEvents();

    // Check if Gemini API key exists
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const systemContext = `You are Smart Campus Companion AI, an academic assistant for ${student.full_name} (${student.register_number}, ${student.department}, ${student.year}).
Student Context:
- Attendance: ${JSON.stringify(attendance)}
- Assignments: ${JSON.stringify(assignments)}
- Student Submissions: ${JSON.stringify(submissions)}
- Upcoming Exams: ${JSON.stringify(exams)}
- Weekly Timetable: ${JSON.stringify(timetable)}
- Recent Announcements: ${JSON.stringify(announcements)}
- Study Materials: ${JSON.stringify(materials)}
- Campus Events: ${JSON.stringify(events)}

Answer the user query accurately using the above student database context when relevant. Provide friendly markdown formatted answers.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemContext}\n\nStudent Question: ${query}` }] }
            ]
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const replyText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            this.saveHistory(student.id, conversationId, query, replyText);
            return replyText;
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, using database context fallback generator.', err);
      }
    }

    // High-Precision Local Context Analytical Engine Fallback
    let reply = '';

    // 1. Attendance Questions
    if (qLower.includes('attendance') || qLower.includes('absent') || qLower.includes('present')) {
      if (!attendance || attendance.length === 0) {
        reply = `📊 **Attendance Update for ${student.full_name}**:\nNo attendance records found in the database yet. Ask your course administrator to publish your attendance.`;
      } else {
        const totalPresent = attendance.reduce((acc, r) => acc + r.present_days, 0);
        const totalClasses = attendance.reduce((acc, r) => acc + r.total_days, 0);
        const overallPct = Math.round((totalPresent / (totalClasses || 1)) * 100);

        if (qLower.includes('lowest') || qLower.includes('warning') || qLower.includes('low')) {
          const lowestSubj = [...attendance].sort((a, b) => (a.present_days / (a.total_days || 1)) - (b.present_days / (b.total_days || 1)))[0];
          const lowestPct = Math.round((lowestSubj.present_days / (lowestSubj.total_days || 1)) * 100);
          reply = `⚠️ **Lowest Attendance Subject**:\nYour lowest attendance is in **${lowestSubj.subject_name} (${lowestSubj.subject_code})** at **${lowestPct}%** (${lowestSubj.present_days}/${lowestSubj.total_days} classes attended).\n\n💡 *Tip: Try to attend the next 2-3 sessions to bring this above the 75% threshold!*`;
        } else {
          const breakdown = attendance.map(r => {
            const pct = Math.round((r.present_days / (r.total_days || 1)) * 100);
            const status = pct < 75 ? '⚠️ Warning (<75%)' : '✅ Good';
            return `• **${r.subject_name}**: ${pct}% (${r.present_days}/${r.total_days} days) - ${status}`;
          }).join('\n');

          reply = `📊 **Your Academic Attendance Summary**\n\nOverall Attendance: **${overallPct}%** (${totalPresent}/${totalClasses} Total Working Days)\n\n**Subject Breakdown:**\n${breakdown}`;
        }
      }
    }

    // 2. Pending Assignments Questions
    else if (qLower.includes('assignment') || qLower.includes('pending') || qLower.includes('due') || qLower.includes('homework')) {
      const submittedIds = new Set(submissions.filter(s => s.status === 'Submitted' || s.status === 'Graded').map(s => s.assignment_id));
      const pendingAsgs = assignments.filter(a => !submittedIds.has(a.id));

      if (pendingAsgs.length === 0) {
        reply = `🎉 **Great Job!** You have **0 pending assignments**. All coursework is up to date!`;
      } else {
        const list = pendingAsgs.map(a => {
          const daysLeft = Math.ceil((new Date(a.due_date).getTime() - Date.now()) / 86400000);
          const dueTag = daysLeft < 0 ? '❌ Overdue' : daysLeft === 0 ? '🔥 Due Today!' : `⏳ Due in ${daysLeft} days`;
          return `• **${a.title}** (${a.subject_name})\n  📅 Due: ${new Date(a.due_date).toLocaleDateString()} | ${dueTag} | Max Marks: ${a.max_marks}`;
        }).join('\n\n');

        reply = `📝 **Pending Assignments (${pendingAsgs.length})**:\n\n${list}\n\n💡 *Head over to the Assignment Manager to upload your work.*`;
      }
    }

    // 3. Exam Questions
    else if (qLower.includes('exam') || qLower.includes('test') || qLower.includes('schedule')) {
      const upcomingExams = exams.filter(e => new Date(e.exam_date).getTime() >= new Date().setHours(0,0,0,0));

      if (upcomingExams.length === 0) {
        reply = `🗓️ **Exam Status**:\nThere are currently no upcoming exams scheduled for ${student.department} (${student.year}).`;
      } else {
        const nextExam = upcomingExams[0];
        const daysUntil = Math.ceil((new Date(nextExam.exam_date).getTime() - Date.now()) / 86400000);

        const examList = upcomingExams.map(e => 
          `• **${e.title}** [${e.category}]\n  📖 Subject: ${e.subject_name}\n  📅 Date: ${e.exam_date} | ⏰ ${e.start_time} - ${e.end_time} | 🏫 Room: ${e.room}`
        ).join('\n\n');

        reply = `🎯 **Next Upcoming Exam**:\n**${nextExam.title}** is in **${daysUntil} days** (${nextExam.exam_date} at ${nextExam.start_time}).\n\n📋 **Full Exam Schedule:**\n${examList}`;
      }
    }

    // 4. Timetable / Classes Questions
    else if (qLower.includes('class') || qLower.includes('timetable') || qLower.includes('today') || qLower.includes('tomorrow') || qLower.includes('schedule')) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = qLower.includes('tomorrow') 
        ? days[(new Date().getDay() + 1) % 7]
        : days[new Date().getDay()];

      const dayClasses = timetable.filter(t => t.day_of_week === targetDay);

      if (dayClasses.length === 0) {
        reply = `📅 **Timetable for ${targetDay}**:\nNo scheduled lectures or labs for ${targetDay}. Enjoy your self-study time!`;
      } else {
        const scheduleList = dayClasses.map(c => 
          `• **${c.start_time} - ${c.end_time}**: ${c.subject_name}\n  👨‍🏫 ${c.faculty_name || 'Faculty'} | 🏫 Room: ${c.room}`
        ).join('\n\n');

        reply = `📚 **Classes for ${targetDay} (${student.department}, ${student.year})**:\n\n${scheduleList}`;
      }
    }

    // 5. Announcements Questions
    else if (qLower.includes('announcement') || qLower.includes('news') || qLower.includes('notice')) {
      if (announcements.length === 0) {
        reply = `📢 **Announcements**:\nNo active announcements at this time.`;
      } else {
        const list = announcements.slice(0, 4).map(a => 
          `• **[${a.priority}] ${a.title}**\n  ${a.description}\n  *Posted: ${new Date(a.created_at || '').toLocaleDateString()}*`
        ).join('\n\n');

        reply = `📢 **Latest Campus Announcements**:\n\n${list}`;
      }
    }

    // 6. Study Plan / Revision Assistance
    else if (qLower.includes('study plan') || qLower.includes('revise') || qLower.includes('focus') || qLower.includes('prepare')) {
      const urgentExams = exams.filter(e => new Date(e.exam_date).getTime() >= Date.now()).slice(0, 2);
      const lowAtt = attendance.find(a => (a.present_days / (a.total_days || 1)) < 0.75);

      reply = `🧠 **Personalized AI Study Plan for ${student.full_name}**\n\n` +
        `1. 🎯 **Immediate Focus**: ${urgentExams.length > 0 ? `Prepare for upcoming **${urgentExams[0].title}** on ${urgentExams[0].exam_date}.` : 'Review core concepts in DBMS and AI.'}\n` +
        `2. ⚠️ **Attendance Alert**: ${lowAtt ? `Attend next lectures for **${lowAtt.subject_name}** to raise attendance above 75%.` : 'Maintain current strong attendance.'}\n` +
        `3. 📝 **Assignment Queue**: Complete pending assignments to earn continuous assessment marks.\n` +
        `4. 📖 **Study Materials**: Access PDF & PPT lecture guides in the Study Material Hub.`;
    }

    // 7. Academic Questions (DBMS / Java / Deadlock / Normalization / Networks / AI)
    else if (qLower.includes('inheritance')) {
      reply = `📘 **Academic Concept: Inheritance in Object-Oriented Programming**\n\nInheritance allows a new class (derived/subclass) to inherit attributes and methods from an existing class (base/superclass).\n\n**Key Types:**\n1. **Single**: Subclass inherits from one superclass.\n2. **Multilevel**: A class inherits from a subclass.\n3. **Multiple**: A class inherits from multiple classes (interfaces in Java).\n\n**Example (Java):**\n\`\`\`java\nclass Animal { void eat() { System.out.println("Eating"); } }\nclass Dog extends Animal { void bark() { System.out.println("Barking"); } }\n\`\`\``;
    }
    else if (qLower.includes('normalization') || qLower.includes('1nf') || qLower.includes('3nf')) {
      reply = `📘 **Academic Concept: Database Normalization**\n\nNormalization is the process of organizing database fields and tables to minimize redundancy and dependency anomalies.\n\n• **1NF**: Atomic values, no repeating groups.\n• **2NF**: In 1NF and no partial dependencies (all non-key attributes depend on whole primary key).\n• **3NF**: In 2NF and no transitive dependencies.\n• **BCNF**: Strict 3NF where every determinant is a candidate key.`;
    }
    else if (qLower.includes('deadlock') || qLower.includes('operating system')) {
      reply = `📘 **Academic Concept: Operating System Deadlock**\n\nA deadlock occurs when a set of processes are blocked because each process holds a resource and waits for another resource held by another process.\n\n**4 Necessary Conditions (Coffman Conditions):**\n1. **Mutual Exclusion**: Resource cannot be shared.\n2. **Hold and Wait**: Process holding resources requests additional ones.\n3. **No Preemption**: Resources cannot be forcibly taken.\n4. **Circular Wait**: A closed chain of processes exists where each waits for a resource held by the next.`;
    }

    // Default Fallback
    else {
      reply = `🤖 **Campus Assistant at your service!**\n\nI can help you with:\n` +
        `• 📊 **Attendance**: "What is my attendance?" or "Which subject is lowest?"\n` +
        `• 📝 **Assignments**: "What assignments are pending?"\n` +
        `• 🗓️ **Exams**: "When is my next exam?"\n` +
        `• 📚 **Classes**: "What classes do I have today?" or "Tomorrow's schedule?"\n` +
        `• 💡 **Academic Questions**: Ask me to explain concepts in DBMS, Networks, OS, or AI!\n` +
        `• 📢 **Campus News**: "What are the latest announcements?"`;
    }

    this.saveHistory(student.id, conversationId, query, reply);
    return reply;
  },

  saveHistory(studentId: string, conversationId: string, userMsg: string, assistantMsg: string) {
    dbStore.saveAIChatMessage({
      student_id: studentId,
      conversation_id: conversationId,
      role: 'user',
      message: userMsg
    });

    dbStore.saveAIChatMessage({
      student_id: studentId,
      conversation_id: conversationId,
      role: 'assistant',
      message: assistantMsg
    });
  },

  async getChatHistory(studentId: string): Promise<AIChatMessage[]> {
    return dbStore.getAIChatHistory(studentId);
  }
};
