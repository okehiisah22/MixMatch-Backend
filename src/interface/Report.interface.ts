export interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

export interface PaginatedReports {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
