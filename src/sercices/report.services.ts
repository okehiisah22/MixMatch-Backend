import { Report, PaginatedReports } from '../interface/Report.interface';

class ReportService {
  private reports: Report[] = [];

  constructor() {
    // Initialize mock data
    for (let i = 0; i < 50; i++) {
      this.reports.push({
        id: `${i + 1}`,
        title: `Report ${i + 1}`,
        description: `Description for report ${i + 1}`,
        status: Math.random() > 0.5 ? 'pending' : 'resolved',
        createdAt: new Date(),
      });
    }
  }

  public getReports(
    status?: 'pending' | 'resolved',
    page: number = 1,
    limit: number = 10
  ): PaginatedReports {
    const filtered = status
      ? this.reports.filter((report) => report.status === status)
      : this.reports;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  public markAsReviewed(id: string): Report | null {
    const report = this.reports.find((report) => report.id === id);
    if (!report || report.status === 'resolved') return null;

    report.status = 'resolved';
    return report;
  }
}

export default new ReportService();
