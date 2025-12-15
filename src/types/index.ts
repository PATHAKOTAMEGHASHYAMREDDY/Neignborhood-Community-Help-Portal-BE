export interface User {
  id?: number;
  name: string;
  contact_info: string;
  location: string;
  password: string;
  role: 'Resident' | 'Helper';
  created_at?: Date;
}

export interface HelpRequest {
  id?: number;
  resident_id: number;
  helper_id?: number | null;
  title: string;
  description: string;
  category: string;
  status: 'Pending' | 'Accepted' | 'In-progress' | 'Completed';
  attachments?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthRequest {
  contact_info: string;
  password: string;
  role: 'Resident' | 'Helper';
}

export interface RegisterRequest extends User {
  confirmPassword?: string;
}
