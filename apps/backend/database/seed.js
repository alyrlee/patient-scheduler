import { openDb } from './src/db.js';
import { nanoid } from 'nanoid';

const db = openDb();

function seed() {
  const providers = [
    // Cardiology (existing)
    { id: 'p1',  doctor: 'Dr. Amy Kim',         specialty: 'Cardiology',   location: 'Dallas',  rating: 4.8 },
    { id: 'p2',  doctor: 'Dr. Ravi Patel',      specialty: 'Cardiology',   location: 'Plano',   rating: 4.7 },
    { id: 'p3',  doctor: 'Dr. Sophia Nguyen',   specialty: 'Cardiology',   location: 'Frisco',  rating: 4.9 },

    // Oncology
    { id: 'p4',  doctor: 'Dr. Marcus Alvarez',  specialty: 'Oncology',     location: 'Dallas',  rating: 4.6 },
    { id: 'p5',  doctor: 'Dr. Lila Shah',       specialty: 'Oncology',     location: 'Plano',   rating: 4.8 },

    // Pediatrics
    { id: 'p6',  doctor: 'Dr. Hannah Brooks',   specialty: 'Pediatrics',   location: 'Frisco',  rating: 4.9 },
    { id: 'p7',  doctor: 'Dr. Omar Haddad',     specialty: 'Pediatrics',   location: 'Dallas',  rating: 4.7 },

    // Orthopedics
    { id: 'p8',  doctor: 'Dr. Jordan Lee',      specialty: 'Orthopedics',  location: 'Plano',   rating: 4.6 },
    { id: 'p9',  doctor: 'Dr. Priya Menon',     specialty: 'Orthopedics',  location: 'Frisco',  rating: 4.8 },

    // Dermatology
    { id: 'p10', doctor: 'Dr. Brian O’Connell', specialty: 'Dermatology',  location: 'Plano',   rating: 4.7 },
    { id: 'p11', doctor: 'Dr. Keiko Tanaka',    specialty: 'Dermatology',  location: 'Dallas',  rating: 4.8 },

    // Neurology
    { id: 'p12', doctor: 'Dr. Elena Garcia',    specialty: 'Neurology',    location: 'Frisco',  rating: 4.7 },
    { id: 'p13', doctor: 'Dr. Thomas Reed',     specialty: 'Neurology',    location: 'Dallas',  rating: 4.9 },
  ];

  const insertProvider = db.prepare(
    `INSERT OR REPLACE INTO providers (id,doctor,specialty,location,rating) VALUES (@id,@doctor,@specialty,@location,@rating)`
  );
  const insertSlot = db.prepare(
    `INSERT OR REPLACE INTO slots (id,provider_id,start,status) VALUES (@id,@provider_id,@start,@status)`
  );

  const tx = db.transaction(() => {
    providers.forEach(p => insertProvider.run(p));

    // a few slots per provider (this week)
    const base = new Date();
    [0, 1, 2, 3, 4].forEach(d => {
      ['10:00', '13:00', '15:30'].forEach(t => {
        const day = new Date(base);
        day.setDate(base.getDate() + d + 1);
        const [hh, mm] = t.split(':');
        day.setHours(hh, mm, 0, 0);
        providers.forEach(p => {
          insertSlot.run({
            id: nanoid(8),
            provider_id: p.id,
            start: day.toISOString(),
            status: 'open',
          });
        });
      });
    });
  });
  tx();

  console.log('Seed complete ✓');
}

seed();
