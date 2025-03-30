const UserReportService = require('../services/userReportService');
const { validationResult } = require('express-validator');

class UserReportController {
  async reportUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const report = await UserReportService.createReport(
        req.user.id,
        req.body.reportedUserId,
        {
          reason: req.body.reason,
          details: req.body.details,
        }
      );
      res.status(201).json(report);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error reporting user', error: error.message });
    }
  }

  async getUserReports(req, res) {
    try {
      const { status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const reports = await UserReportService.getReports(status, page, limit);
      res.json(reports);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching user reports', error: error.message });
    }
  }

  async handleReport(req, res) {
    try {
      const { reportId } = req.params;
      const { status, actionTaken, actionDetails } = req.body;

      const updatedReport = await UserReportService.updateReportStatus(
        reportId,
        {
          status,
          actionTaken,
          actionDetails,
          adminId: req.user.id,
        }
      );

      if (!updatedReport) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json(updatedReport);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error handling report', error: error.message });
    }
  }
}

module.exports = new UserReportController();
