import { CourseFileParsed, PasswordFileParsed } from '../../types/course';

export function getSampleCourseData(): {
  courseFiles: CourseFileParsed[];
  passwordFiles: PasswordFileParsed[];
} {
  const courses = [
    { key: 'Data Structures and Algorithms - DSA101 (%)', label: 'Data Structures and Algorithms', code: 'DSA101' },
    { key: 'Programming in Python - PY201 (%)', label: 'Programming in Python', code: 'PY201' },
    { key: 'Web Architecture & Front-End - WEB301 (%)', label: 'Web Architecture & Front-End', code: 'WEB301' },
  ];

  const sections = [
    { batch: '2024-2028', branch: 'CSE', section: 'A', label: 'CSE-A', studentCount: 45, avgBase: 74 },
    { batch: '2024-2028', branch: 'CSE', section: 'B', label: 'CSE-B', studentCount: 42, avgBase: 68 },
    { batch: '2024-2028', branch: 'ECE', section: 'A', label: 'ECE-A', studentCount: 38, avgBase: 58 },
    { batch: '2024-2028', branch: 'AIML', section: 'A', label: 'AIML-A', studentCount: 40, avgBase: 82 },
  ];

  const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Pooja', 'Rahul', 'Divya', 'Aditya', 'Meera', 'Sai', 'Kavya', 'Kiran', 'Nikhil', 'Tanvi', 'Varun', 'Harini', 'Abhishek', 'Shreya', 'Siddharth'];
  const lastNames = ['Sharma', 'Reddy', 'Verma', 'Patel', 'Rao', 'Iyer', 'Kumar', 'Nair', 'Chowdhury', 'Mishra', 'Gupta', 'Singh', 'Bhat', 'Deshmukh'];

  const courseStudents = [];

  for (const sec of sections) {
    for (let i = 1; i <= sec.studentCount; i++) {
      const fn = firstNames[(i * 3 + sec.label.charCodeAt(0)) % firstNames.length];
      const ln = lastNames[(i * 5 + sec.label.charCodeAt(1)) % lastNames.length];
      const id = `24${sec.branch}${sec.section}${String(i).padStart(3, '0')}`;
      const name = `${fn} ${ln}`;
      const email = `${id.toLowerCase()}@institution.ac.in`;
      const groups = `${sec.batch}-${sec.branch}-${sec.section}`;

      // Progress generator
      const rand = Math.sin(i * 12.34 + sec.avgBase) * 0.5 + 0.5; // deterministic 0..1
      const isNotStarted = i % 11 === 0;
      const isLow = i % 7 === 0;

      const courseValues: Record<string, { value: number; notStarted: boolean }> = {};
      let sum = 0;

      courses.forEach((c, cIdx) => {
        let val = 0;
        let notStarted = false;
        if (isNotStarted) {
          val = 0;
          notStarted = true;
        } else if (isLow) {
          val = Math.round(15 + rand * 22);
          notStarted = false;
        } else {
          val = Math.min(100, Math.round(sec.avgBase + (rand - 0.5) * 35 + cIdx * 4));
          if (val > 95 && i % 3 === 0) val = 100;
          if (val <= 0) {
            val = 0;
            notStarted = true;
          }
        }
        courseValues[c.key] = { value: val, notStarted };
        sum += val;
      });

      const avg = sum / courses.length;
      courseStudents.push({
        id,
        name,
        email,
        groups,
        courseValues,
        avg,
      });
    }
  }

  const courseFiles: CourseFileParsed[] = [
    {
      kind: 'course',
      fileName: '2024-2028_Course_Progress_Export.xlsx',
      meta: { batch: '2024-2028', branch: 'CSE', section: 'Combined', label: 'Combined Cohort' },
      courses,
      students: courseStudents,
    },
  ];

  // Password not set entries
  const passwordEntries = [
    { name: 'Gautam Teja', email: '24csea046@institution.ac.in', groups: '2024-2028-CSE-A', createdTime: '2026-08-01 10:14:22' },
    { name: 'Karthik Raja', email: '24csea047@institution.ac.in', groups: '2024-2028-CSE-A', createdTime: '2026-08-01 10:14:22' },
    { name: 'Mounika Rao', email: '24cseb043@institution.ac.in', groups: '2024-2028-CSE-B', createdTime: '2026-08-01 11:20:15' },
    { name: 'Chaitanya V', email: '24cseb044@institution.ac.in', groups: '2024-2028-CSE-B', createdTime: '2026-08-01 11:20:15' },
    { name: 'Praveen Goud', email: '24ecea039@institution.ac.in', groups: '2024-2028-ECE-A', createdTime: '2026-08-02 09:30:10' },
    { name: 'Lalitha Devi', email: '24ecea040@institution.ac.in', groups: '2024-2028-ECE-A', createdTime: '2026-08-02 09:30:10' },
    { name: 'Rohit Naidu', email: '24ecea041@institution.ac.in', groups: '2024-2028-ECE-A', createdTime: '2026-08-02 09:30:10' },
    { name: 'Bhavana S', email: '24aimla041@institution.ac.in', groups: '2024-2028-AIML-A', createdTime: '2026-08-03 14:12:00' },
  ];

  const passwordFiles: PasswordFileParsed[] = [
    {
      kind: 'password',
      fileName: '2024-2028_Password_Not_Set_Export.xlsx',
      meta: { batch: '2024-2028', branch: 'General', section: 'Password Issues', label: 'Password Issues' },
      entries: passwordEntries,
    },
  ];

  return { courseFiles, passwordFiles };
}
