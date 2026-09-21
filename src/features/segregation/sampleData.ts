import { SegregationParsedData } from '../../types/segregation';

export function getSampleSegregationData(): SegregationParsedData {
  const sections = [
    { key: 'Coding - Easy (10M)', name: 'Coding - Easy', max: 10, coding: true },
    { key: 'Coding - Medium (20M)', name: 'Coding - Medium', max: 20, coding: true },
    { key: 'Coding - Hard (30M)', name: 'Coding - Hard', max: 30, coding: true },
    { key: 'Aptitude & Reasoning (20M)', name: 'Aptitude & Reasoning', max: 20, coding: false },
    { key: 'Technical MCQs (20M)', name: 'Technical MCQs', max: 20, coding: false },
  ];

  const totalMax = 100;
  const groups = ['2024-2028-CSE-A', '2024-2028-CSE-B', '2024-2028-IT-A', '2024-2028-AIML-A'];
  const firstNames = ['Aarav', 'Neha', 'Rohan', 'Sneha', 'Vikram', 'Pooja', 'Rahul', 'Divya', 'Aditya', 'Meera', 'Sai', 'Kavya', 'Kiran', 'Nikhil', 'Tanvi', 'Varun', 'Harini', 'Abhishek', 'Shreya', 'Siddharth'];
  const lastNames = ['Sharma', 'Reddy', 'Verma', 'Patel', 'Rao', 'Iyer', 'Kumar', 'Nair', 'Chowdhury', 'Mishra'];

  const cands = [];
  let seq = 1;

  for (const grp of groups) {
    const studentCount = 30;
    const baseAbility = grp.includes('AIML') ? 0.75 : grp.includes('CSE-A') ? 0.72 : grp.includes('CSE-B') ? 0.64 : 0.55;

    for (let i = 1; i <= studentCount; i++) {
      const id = `24${grp.split('-')[2]}${String(i).padStart(3, '0')}`;
      const name = `${firstNames[(seq * 3) % firstNames.length]} ${lastNames[(seq * 7) % lastNames.length]}`;
      seq++;

      const isNotAttempted = i % 12 === 0;
      if (isNotAttempted) {
        cands.push({
          id,
          name,
          group: grp,
          scores: [0, 0, 0, 0, 0],
          total: 0,
          attempted: false,
          sheetPassed: false,
        });
      } else {
        const rand = Math.sin(seq * 11.23) * 0.5 + 0.5;
        const ability = Math.max(0.1, Math.min(1.0, baseAbility + (rand - 0.5) * 0.4));

        // Scores per section
        const sEasy = Math.min(10, Math.round(ability * 10 + (rand > 0.4 ? 1 : -1)));
        const sMed = Math.min(20, Math.round(ability * 20 * (rand > 0.3 ? 1 : 0.6)));
        const sHard = Math.min(30, Math.round(ability > 0.6 ? ability * 30 * rand : (rand > 0.8 ? 15 : 0)));
        const sApt = Math.min(20, Math.round(10 + rand * 10));
        const sTech = Math.min(20, Math.round(8 + rand * 12));

        const scores = [sEasy, sMed, sHard, sApt, sTech];
        const total = scores.reduce((a, b) => a + b, 0);

        cands.push({
          id,
          name,
          group: grp,
          scores,
          total,
          attempted: true,
          sheetPassed: total >= 50,
        });
      }
    }
  }

  const cutoff = 50;
  const adv = 75;
  const avgMin = 30;

  return {
    cands,
    sections,
    totalMax,
    cutoff,
    inferred: true,
    sheetCut: 50,
    hasGroup: true,
    hasId: true,
    cutoffUsed: cutoff,
    adv,
    avgMin,
  };
}
