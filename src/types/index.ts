export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface University {
  id: string;
  name: string;
  location?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  userId: string;
  universityId: string;
  status: 'planning' | 'in_progress' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted';
  deadline?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
