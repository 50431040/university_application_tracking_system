import { PrismaClient } from '@prisma/client'
import { hashPasswordMD5 } from '../src/app/api/_lib/utils/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create test users
  console.log('👤 Creating test users...')
  
  // Create student user
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      passwordHash: hashPasswordMD5('password123'),
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'student'
    }
  })

  // Create parent user
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@demo.com',
      passwordHash: hashPasswordMD5('password123'),
      firstName: 'Michael',
      lastName: 'Johnson',
      role: 'parent'
    }
  })

  // Create student profile
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      name: 'Sarah Johnson',
      email: 'student@demo.com',
      graduationYear: 2025,
      gpa: 3.85,
      satScore: 1450,
      actScore: 32,
      targetCountries: ['United States'],
      intendedMajors: ['Computer Science', 'Data Science', 'Mathematics']
    }
  })

  // Create student-parent relationship
  await prisma.studentParentRelationship.create({
    data: {
      studentId: student.id,
      parentId: parentUser.id
    }
  })

  console.log('🏫 Creating universities...')

  // University data with realistic information
  const universities = [
    {
      name: 'Harvard University',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Cambridge',
      usNewsRanking: 3,
      acceptanceRate: 3.4,
      applicationSystem: 'Common App',
      tuitionInState: 59076,
      tuitionOutState: 59076,
      applicationFee: 85,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-12-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'Biology', 'Psychology', 'Mathematics']
    },
    {
      name: 'Stanford University',
      country: 'United States',
      state: 'California',
      city: 'Stanford',
      usNewsRanking: 3,
      acceptanceRate: 3.9,
      applicationSystem: 'Common App',
      tuitionInState: 61731,
      tuitionOutState: 61731,
      applicationFee: 90,
      deadlines: {
        'early_action': '2025-09-15T00:00:00Z',
        'regular_decision': '2025-12-15T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law']
    },
    {
      name: 'Massachusetts Institute of Technology',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Cambridge',
      usNewsRanking: 2,
      acceptanceRate: 4.1,
      applicationSystem: 'Direct',
      tuitionInState: 59750,
      tuitionOutState: 59750,
      applicationFee: 85,
      deadlines: {
        'early_action': '2025-09-30T00:00:00Z',
        'regular_decision': '2025-12-31T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Economics']
    },
    {
      name: 'Princeton University',
      country: 'United States',
      state: 'New Jersey',
      city: 'Princeton',
      usNewsRanking: 1,
      acceptanceRate: 5.8,
      applicationSystem: 'Common App',
      tuitionInState: 59710,
      tuitionOutState: 59710,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'Politics', 'Engineering', 'Mathematics']
    },
    {
      name: 'Yale University',
      country: 'United States',
      state: 'Connecticut',
      city: 'New Haven',
      usNewsRanking: 5,
      acceptanceRate: 4.6,
      applicationSystem: 'Common App',
      tuitionInState: 64700,
      tuitionOutState: 64700,
      applicationFee: 80,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'History', 'Political Science', 'Biology']
    },
    {
      name: 'University of Chicago',
      country: 'United States',
      state: 'Illinois',
      city: 'Chicago',
      usNewsRanking: 6,
      acceptanceRate: 7.4,
      applicationSystem: 'Common App',
      tuitionInState: 64965,
      tuitionOutState: 64965,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Economics', 'Computer Science', 'Mathematics', 'Physics', 'Biology']
    },
    {
      name: 'University of Pennsylvania',
      country: 'United States',
      state: 'Pennsylvania',
      city: 'Philadelphia',
      usNewsRanking: 6,
      acceptanceRate: 8.1,
      applicationSystem: 'Common App',
      tuitionInState: 63452,
      tuitionOutState: 63452,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Business', 'Computer Science', 'Engineering', 'Economics', 'Biology']
    },
    {
      name: 'California Institute of Technology',
      country: 'United States',
      state: 'California',
      city: 'Pasadena',
      usNewsRanking: 9,
      acceptanceRate: 6.4,
      applicationSystem: 'Common App',
      tuitionInState: 63255,
      tuitionOutState: 63255,
      applicationFee: 85,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Engineering', 'Computer Science', 'Physics', 'Mathematics', 'Chemistry']
    },
    {
      name: 'Duke University',
      country: 'United States',
      state: 'North Carolina',
      city: 'Durham',
      usNewsRanking: 10,
      acceptanceRate: 7.8,
      applicationSystem: 'Common App',
      tuitionInState: 63054,
      tuitionOutState: 63054,
      applicationFee: 85,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'Biology', 'Psychology', 'Engineering']
    },
    {
      name: 'Johns Hopkins University',
      country: 'United States',
      state: 'Maryland',
      city: 'Baltimore',
      usNewsRanking: 9,
      acceptanceRate: 11.5,
      applicationSystem: 'Common App',
      tuitionInState: 63340,
      tuitionOutState: 63340,
      applicationFee: 70,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Biology', 'Medicine', 'Engineering', 'Public Health']
    },
    {
      name: 'Northwestern University',
      country: 'United States',
      state: 'Illinois',
      city: 'Evanston',
      usNewsRanking: 9,
      acceptanceRate: 8.9,
      applicationSystem: 'Common App',
      tuitionInState: 64887,
      tuitionOutState: 64887,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Journalism', 'Business', 'Economics']
    },
    {
      name: 'Dartmouth College',
      country: 'United States',
      state: 'New Hampshire',
      city: 'Hanover',
      usNewsRanking: 12,
      acceptanceRate: 9.2,
      applicationSystem: 'Common App',
      tuitionInState: 63684,
      tuitionOutState: 63684,
      applicationFee: 80,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'Government', 'Psychology', 'Engineering']
    },
    {
      name: 'Brown University',
      country: 'United States',
      state: 'Rhode Island',
      city: 'Providence',
      usNewsRanking: 13,
      acceptanceRate: 7.1,
      applicationSystem: 'Common App',
      tuitionInState: 65656,
      tuitionOutState: 65656,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'Biology', 'International Relations', 'Engineering']
    },
    {
      name: 'Vanderbilt University',
      country: 'United States',
      state: 'Tennessee',
      city: 'Nashville',
      usNewsRanking: 13,
      acceptanceRate: 11.7,
      applicationSystem: 'Common App',
      tuitionInState: 63946,
      tuitionOutState: 63946,
      applicationFee: 50,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'Engineering', 'Medicine', 'Business']
    },
    {
      name: 'Rice University',
      country: 'United States',
      state: 'Texas',
      city: 'Houston',
      usNewsRanking: 15,
      acceptanceRate: 11.0,
      applicationSystem: 'Common App',
      tuitionInState: 58128,
      tuitionOutState: 58128,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Architecture', 'Music']
    },
    {
      name: 'Washington University in St. Louis',
      country: 'United States',
      state: 'Missouri',
      city: 'St. Louis',
      usNewsRanking: 16,
      acceptanceRate: 16.3,
      applicationSystem: 'Common App',
      tuitionInState: 63373,
      tuitionOutState: 63373,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Architecture']
    },
    {
      name: 'Cornell University',
      country: 'United States',
      state: 'New York',
      city: 'Ithaca',
      usNewsRanking: 17,
      acceptanceRate: 10.9,
      applicationSystem: 'Common App',
      tuitionInState: 65204,
      tuitionOutState: 65204,
      applicationFee: 80,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Agriculture', 'Business', 'Architecture']
    },
    {
      name: 'University of Notre Dame',
      country: 'United States',
      state: 'Indiana',
      city: 'Notre Dame',
      usNewsRanking: 18,
      acceptanceRate: 18.7,
      applicationSystem: 'Common App',
      tuitionInState: 62693,
      tuitionOutState: 62693,
      applicationFee: 75,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Engineering', 'Liberal Arts', 'Architecture']
    },
    {
      name: 'University of California, Los Angeles',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      usNewsRanking: 20,
      acceptanceRate: 14.3,
      applicationSystem: 'Direct',
      tuitionInState: 13804,
      tuitionOutState: 46326,
      applicationFee: 80,
      deadlines: {
        'regular_decision': '2025-09-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Film', 'Medicine']
    },
    {
      name: 'Emory University',
      country: 'United States',
      state: 'Georgia',
      city: 'Atlanta',
      usNewsRanking: 22,
      acceptanceRate: 16.5,
      applicationSystem: 'Common App',
      tuitionInState: 59920,
      tuitionOutState: 59920,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Medicine', 'Psychology', 'Biology']
    },
    {
      name: 'University of California, Berkeley',
      country: 'United States',
      state: 'California',
      city: 'Berkeley',
      usNewsRanking: 22,
      acceptanceRate: 17.5,
      applicationSystem: 'Direct',
      tuitionInState: 14826,
      tuitionOutState: 47348,
      applicationFee: 80,
      deadlines: {
        'regular_decision': '2025-09-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Economics', 'Biology']
    },
    {
      name: 'Georgetown University',
      country: 'United States',
      state: 'District of Columbia',
      city: 'Washington',
      usNewsRanking: 22,
      acceptanceRate: 17.0,
      applicationSystem: 'Coalition',
      tuitionInState: 63238,
      tuitionOutState: 63238,
      applicationFee: 75,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['International Relations', 'Business', 'Government', 'Economics', 'Computer Science']
    },
    {
      name: 'University of Michigan',
      country: 'United States',
      state: 'Michigan',
      city: 'Ann Arbor',
      usNewsRanking: 25,
      acceptanceRate: 26.1,
      applicationSystem: 'Common App',
      tuitionInState: 17786,
      tuitionOutState: 56941,
      applicationFee: 75,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law']
    },
    {
      name: 'University of Virginia',
      country: 'United States',
      state: 'Virginia',
      city: 'Charlottesville',
      usNewsRanking: 25,
      acceptanceRate: 23.9,
      applicationSystem: 'Common App',
      tuitionInState: 21381,
      tuitionOutState: 58950,
      applicationFee: 70,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Economics', 'Engineering', 'Business', 'Medicine']
    },
    {
      name: 'Carnegie Mellon University',
      country: 'United States',
      state: 'Pennsylvania',
      city: 'Pittsburgh',
      usNewsRanking: 28,
      acceptanceRate: 17.3,
      applicationSystem: 'Common App',
      tuitionInState: 63829,
      tuitionOutState: 63829,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Fine Arts', 'Drama']
    },
    {
      name: 'University of North Carolina at Chapel Hill',
      country: 'United States',
      state: 'North Carolina',
      city: 'Chapel Hill',
      usNewsRanking: 28,
      acceptanceRate: 23.2,
      applicationSystem: 'Common App',
      tuitionInState: 8992,
      tuitionOutState: 39338,
      applicationFee: 85,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Journalism', 'Medicine', 'Public Health']
    },
    {
      name: 'Wake Forest University',
      country: 'United States',
      state: 'North Carolina',
      city: 'Winston-Salem',
      usNewsRanking: 29,
      acceptanceRate: 30.4,
      applicationSystem: 'Common App',
      tuitionInState: 64758,
      tuitionOutState: 64758,
      applicationFee: 65,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Medicine', 'Liberal Arts', 'Engineering']
    },
    {
      name: 'University of Rochester',
      country: 'United States',
      state: 'New York',
      city: 'Rochester',
      usNewsRanking: 34,
      acceptanceRate: 41.5,
      applicationSystem: 'Common App',
      tuitionInState: 63150,
      tuitionOutState: 63150,
      applicationFee: 50,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Medicine', 'Music', 'Economics']
    },
    {
      name: 'Boston College',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Chestnut Hill',
      usNewsRanking: 35,
      acceptanceRate: 28.9,
      applicationSystem: 'Common App',
      tuitionInState: 67680,
      tuitionOutState: 67680,
      applicationFee: 80,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Economics', 'Psychology', 'Biology']
    },
    {
      name: 'Georgia Institute of Technology',
      country: 'United States',
      state: 'Georgia',
      city: 'Atlanta',
      usNewsRanking: 33,
      acceptanceRate: 21.0,
      applicationSystem: 'Common App',
      tuitionInState: 12852,
      tuitionOutState: 33794,
      applicationFee: 75,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Architecture', 'Industrial Design']
    },
    {
      name: 'New York University',
      country: 'United States',
      state: 'New York',
      city: 'New York',
      usNewsRanking: 35,
      acceptanceRate: 20.1,
      applicationSystem: 'Common App',
      tuitionInState: 60438,
      tuitionOutState: 60438,
      applicationFee: 80,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Film', 'Drama', 'Economics']
    },
    {
      name: 'University of California, Santa Barbara',
      country: 'United States',
      state: 'California',
      city: 'Santa Barbara',
      usNewsRanking: 35,
      acceptanceRate: 37.0,
      applicationSystem: 'Direct',
      tuitionInState: 14391,
      tuitionOutState: 46913,
      applicationFee: 80,
      deadlines: {
        'regular_decision': '2025-09-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Economics', 'Biology', 'Environmental Science']
    },
    {
      name: 'University of Florida',
      country: 'United States',
      state: 'Florida',
      city: 'Gainesville',
      usNewsRanking: 28,
      acceptanceRate: 23.0,
      applicationSystem: 'Common App',
      tuitionInState: 6381,
      tuitionOutState: 28659,
      applicationFee: 30,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-09-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Journalism']
    },
    {
      name: 'Boston University',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Boston',
      usNewsRanking: 43,
      acceptanceRate: 25.3,
      applicationSystem: 'Common App',
      tuitionInState: 63798,
      tuitionOutState: 63798,
      applicationFee: 80,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Communications', 'Medicine']
    },
    {
      name: 'Northeastern University',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Boston',
      usNewsRanking: 53,
      acceptanceRate: 18.1,
      applicationSystem: 'Common App',
      tuitionInState: 61050,
      tuitionOutState: 61050,
      applicationFee: 75,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Co-op Programs', 'Health Sciences']
    },
    {
      name: 'Tulane University',
      country: 'United States',
      state: 'Louisiana',
      city: 'New Orleans',
      usNewsRanking: 44,
      acceptanceRate: 13.2,
      applicationSystem: 'Common App',
      tuitionInState: 65122,
      tuitionOutState: 65122,
      applicationFee: 50,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Architecture', 'Public Health', 'Liberal Arts']
    },
    {
      name: 'University of California, Irvine',
      country: 'United States',
      state: 'California',
      city: 'Irvine',
      usNewsRanking: 33,
      acceptanceRate: 28.9,
      applicationSystem: 'Direct',
      tuitionInState: 13727,
      tuitionOutState: 46249,
      applicationFee: 80,
      deadlines: {
        'regular_decision': '2025-09-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts']
    },
    {
      name: 'University of California, San Diego',
      country: 'United States',
      state: 'California',
      city: 'San Diego',
      usNewsRanking: 28,
      acceptanceRate: 38.3,
      applicationSystem: 'Direct',
      tuitionInState: 14648,
      tuitionOutState: 47170,
      applicationFee: 80,
      deadlines: {
        'regular_decision': '2025-09-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Biology', 'Economics', 'Medicine']
    },
    {
      name: 'University of Southern California',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      usNewsRanking: 28,
      acceptanceRate: 16.1,
      applicationSystem: 'Common App',
      tuitionInState: 66640,
      tuitionOutState: 66640,
      applicationFee: 85,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Film', 'Business', 'Engineering', 'Communications']
    },
    {
      name: 'University of California, Davis',
      country: 'United States',
      state: 'California',
      city: 'Davis',
      usNewsRanking: 28,
      acceptanceRate: 49.0,
      applicationSystem: 'Direct',
      tuitionInState: 15266,
      tuitionOutState: 47788,
      applicationFee: 80,
      deadlines: {
        'regular_decision': '2025-09-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Agriculture', 'Veterinary Medicine', 'Biology']
    },
    {
      name: 'Tufts University',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Medford',
      usNewsRanking: 40,
      acceptanceRate: 16.0,
      applicationSystem: 'Common App',
      tuitionInState: 65222,
      tuitionOutState: 65222,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'International Relations', 'Liberal Arts', 'Medicine']
    },
    {
      name: 'University of Wisconsin-Madison',
      country: 'United States',
      state: 'Wisconsin',
      city: 'Madison',
      usNewsRanking: 38,
      acceptanceRate: 62.1,
      applicationSystem: 'Common App',
      tuitionInState: 10796,
      tuitionOutState: 39427,
      applicationFee: 60,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Agriculture', 'Medicine']
    },
    {
      name: 'Villanova University',
      country: 'United States',
      state: 'Pennsylvania',
      city: 'Villanova',
      usNewsRanking: 51,
      acceptanceRate: 36.2,
      applicationSystem: 'Common App',
      tuitionInState: 65730,
      tuitionOutState: 65730,
      applicationFee: 80,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Engineering', 'Liberal Arts', 'Nursing']
    },
    {
      name: 'Case Western Reserve University',
      country: 'United States',
      state: 'Ohio',
      city: 'Cleveland',
      usNewsRanking: 53,
      acceptanceRate: 30.7,
      applicationSystem: 'Common App',
      tuitionInState: 64628,
      tuitionOutState: 64628,
      applicationFee: 70,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Nursing']
    },
    {
      name: 'Rensselaer Polytechnic Institute',
      country: 'United States',
      state: 'New York',
      city: 'Troy',
      usNewsRanking: 51,
      acceptanceRate: 64.5,
      applicationSystem: 'Common App',
      tuitionInState: 61988,
      tuitionOutState: 61988,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Architecture', 'Business', 'Game Design']
    },
    {
      name: 'Lehigh University',
      country: 'United States',
      state: 'Pennsylvania',
      city: 'Bethlehem',
      usNewsRanking: 51,
      acceptanceRate: 45.1,
      applicationSystem: 'Common App',
      tuitionInState: 62230,
      tuitionOutState: 62230,
      applicationFee: 75,
      deadlines: {
        'early_decision': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Engineering', 'Business', 'Architecture', 'Liberal Arts']
    },
    {
      name: 'Pepperdine University',
      country: 'United States',
      state: 'California',
      city: 'Malibu',
      usNewsRanking: 76,
      acceptanceRate: 49.4,
      applicationSystem: 'Common App',
      tuitionInState: 64012,
      tuitionOutState: 64012,
      applicationFee: 65,
      deadlines: {
        'early_action': '2025-09-01T00:00:00Z',
        'regular_decision': '2025-11-01T00:00:00Z'
      },
      availableMajors: ['Computer Science', 'Business', 'Communications', 'Liberal Arts', 'Law']
    }
  ]

  // Insert universities
  for (const universityData of universities) {
    const university = await prisma.university.create({
      data: universityData
    })

    // Add common requirements for each university
    const requirements = [
      { requirementType: 'essay', isRequired: true, description: 'Personal statement or supplemental essays' },
      { requirementType: 'transcript', isRequired: true, description: 'Official high school transcript' },
      { requirementType: 'recommendation', isRequired: true, description: 'Letters of recommendation from teachers/counselors' }
    ]

    // Add optional requirements based on university type
    if (['MIT', 'Stanford', 'Caltech'].some(name => university.name.includes(name))) {
      requirements.push(
        { requirementType: 'portfolio', isRequired: false, description: 'STEM research portfolio or projects' }
      )
    }

    if (['NYU', 'USC'].some(name => university.name.includes(name))) {
      requirements.push(
        { requirementType: 'interview', isRequired: false, description: 'Optional alumni interview' }
      )
    }

    for (const requirement of requirements) {
      await prisma.universityRequirement.create({
        data: {
          universityId: university.id,
          ...requirement
        }
      })
    }
  }

  console.log('✅ Database seeding completed successfully!')
  console.log(`
📊 Created:
   - 2 test users (student@demo.com, parent@demo.com)
   - 1 student profile (Sarah Johnson)
   - 1 parent-student relationship
   - 30 universities with rankings and details
   - 90+ university requirements

🔑 Test accounts:
   Student: student@demo.com / password123
   Parent: parent@demo.com / password123
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })