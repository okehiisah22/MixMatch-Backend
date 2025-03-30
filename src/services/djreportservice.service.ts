const DJReport = require('../models/DJReport');

class DJReportService {
  async createReport(reporterId, djId, reportData) {
    const report = new DJReport({
      reporter: reporterId,
      dj: djId,
      ...reportData,
    });
    return await report.save();
  }

  async getReportsByDj(djId, status, page = 1, limit = 10) {
    const query = { dj: djId };
    if (status) query.status = status;

    const [reports, total] = await Promise.all([
      DJReport.find(query)
        .populate('reporter', 'username')
        .populate('dj', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      DJReport.countDocuments(query),
    ]);

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateReportStatus(reportId, status, adminId) {
    return await DJReport.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      { new: true }
    );
  }
}

module.exports = new DJReportService();
