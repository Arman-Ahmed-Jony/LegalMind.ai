export type UserRole = 'admin' | 'member';

export type PublicUser = {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LegalCase = {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentRecord = {
  id: string;
  caseId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
};
