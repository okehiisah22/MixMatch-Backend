import { Request, Response } from 'express';
import reportService from '../services/report.service';
import { PaginatedReports } from '../interface/Report.interface';

class ReportController {
  public async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { status, page = '1', limit = '10' } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);

      if (isNaN(parsedPage) throw new Error('Invalid page parameter');
      if (isNaN(parsedLimit)) throw new Error('Invalid limit parameter');
      if (status && !['pending', 'resolved'].includes(status as string)) {
        throw new Error('Invalid status parameter');
      }

      const result: PaginatedReports = reportService.getReports(
        status as 'pending' | 'resolved',
        parsedPage,
        parsedLimit
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  public async markAsReviewed(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedReport = reportService.markAsReviewed(id);
      
      if (!updatedReport) {
        res.status(404).json({ error: 'Report not found or already resolved' });
        return;
      }

      res.status(200).json(updatedReport);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ReportController();