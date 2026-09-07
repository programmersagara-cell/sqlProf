// Registry of available sample databases.
import { companySchema } from './companyDb.js';
import { schoolSchema, shopSchema, librarySchema } from './otherDbs.js';

export const DATABASES = [
  {
    id: 'company_db',
    name: 'company_db',
    description: 'Employees, departments, projects and salary history — the main learning database.',
    schema: companySchema,
  },
  {
    id: 'school_db',
    name: 'school_db',
    description: 'Students, teachers, courses and enrollments.',
    schema: schoolSchema,
  },
  {
    id: 'shop_db',
    name: 'shop_db',
    description: 'Products, customers, orders and order items.',
    schema: shopSchema,
  },
  {
    id: 'library_db',
    name: 'library_db',
    description: 'Books, authors, members and borrowings.',
    schema: librarySchema,
  },
];

/** Challenges are tagged with the db they expect. Helper to find a definition. */
export function getDatabaseDef(id) {
  return DATABASES.find((d) => d.id === id) || DATABASES[0];
}
