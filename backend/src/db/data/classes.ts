export interface ClassData {
  name: string;
  academicTerm: string;
  startDate?: Date;
}

export const initialClasses: ClassData[] = [
  {
    name: 'Rabu, Jam 10 DC 3A',
    academicTerm: '2026/2027 Ganjil',
    startDate: new Date('2026-08-19T00:00:00.000Z'),
  },
  {
    name: 'Kamis, Jam 7 D1 327',
    academicTerm: '2026/2027 Ganjil',
    startDate: new Date('2026-08-20T00:00:00.000Z'),
  },
];
