import { AttemptedRecord, NotAttemptedRecord, SingleTestMeta } from '../../types/singleTest';

export function getSampleSingleTestData(): {
  att: AttemptedRecord[];
  na: NotAttemptedRecord[];
  meta: SingleTestMeta;
} {
  const groups = ['2024-2028-CSE-A', '2024-2028-CSE-B', '2024-2028-ECE-A', '2024-2028-IT-A'];
  const firstNames = ['Aarav', 'Neha', 'Rohan', 'Sneha', 'Vikram', 'Pooja', 'Rahul', 'Divya', 'Aditya', 'Meera', 'Sai', 'Kavya', 'Kiran', 'Nikhil', 'Tanvi', 'Varun', 'Harini', 'Abhishek', 'Shreya', 'Siddharth'];
  const lastNames = ['Sharma', 'Reddy', 'Verma', 'Patel', 'Rao', 'Iyer', 'Kumar', 'Nair', 'Chowdhury', 'Mishra'];

  const max = 100;
  const pass = 50;

  const att: AttemptedRecord[] = [];
  const na: NotAttemptedRecord[] = [];

  let studentSeq = 1;
  groups.forEach((grp, gIdx) => {
    const count = 35 + gIdx * 4;
    const baseScore = 68 - gIdx * 4;

    for (let i = 1; i <= count; i++) {
      const id = `24${grp.split('-')[2]}${String(i).padStart(3, '0')}`;
      const name = `${firstNames[(studentSeq * 3) % firstNames.length]} ${lastNames[(studentSeq * 7) % lastNames.length]}`;
      const email = `${id.toLowerCase()}@institution.ac.in`;
      studentSeq++;

      const isNotAttempted = i % 10 === 0;
      if (isNotAttempted) {
        const reasons = ['Test expired', 'Opened, not started', 'Network interruption', 'Absent'];
        na.push({
          id,
          name,
          email,
          group: grp,
          reason: reasons[i % reasons.length],
        });
      } else {
        const rand = Math.sin(studentSeq * 14.5) * 0.5 + 0.5;
        let score = Math.round(baseScore + (rand - 0.5) * 45);
        if (i % 8 === 0) score = Math.min(100, Math.round(95 + rand * 5));
        if (i % 9 === 0) score = Math.round(20 + rand * 24);
        score = Math.max(0, Math.min(max, score));

        att.push({
          id,
          name,
          email,
          group: grp,
          start: '2026-09-15 10:00:00',
          score,
          status: 'Submitted',
        });
      }
    }
  });

  const meta: SingleTestMeta = {
    college: 'Chaitanya Bharathi Institute of Technology',
    testName: 'Data Structures & Algorithms Mock Assessment',
    batch: '2024-2028',
    date: '2026-09-15',
    max,
    pass,
    preparedBy: 'Department of Training & Placements',
  };

  return { att, na, meta };
}
