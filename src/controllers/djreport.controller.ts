const DJReportService = require('../services/djReportService');
const { validationResult } = require('express-validator');

class DJReportController {
  async reportDJ(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const report = await DJReportService.createReport(
        req.user.id,
        req.body.djId,
        {
          reason: req.body.reason,
          details: req.body.details,
        }
      );
      res.status(201).json(report);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error reporting DJ', error: error.message });
    }
  }

  async getDJReports(req, res) {
    try {
      const { djId, status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const reports = await DJReportService.getReportsByDj(
        djId,
        status,
        page,
        limit
      );
      res.json(reports);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching reports', error: error.message });
    }
  }

  async updateReportStatus(req, res) {
    try {
      const { reportId } = req.params;
      const { status } = req.body;

      const updatedReport = await DJReportService.updateReportStatus(
        reportId,
        status,
        req.user.id
      );

      if (!updatedReport) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json(updatedReport);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error updating report', error: error.message });
    }
  }
}

module.exports = new DJReportController();
