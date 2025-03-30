const UserReport = require('../models/UserReport');

class UserReportService {
  async createReport(reporterId, reportedUserId, reportData) {
    const report = new UserReport({
      reporter: reporterId,
      reportedUser: reportedUserId,
      ...reportData,
    });
    return await report.save();
  }

  async getReports(status, page = 1, limit = 10) {
    const query = {};
    if (status) query.status = status;

    const [reports, total] = await Promise.all([
      UserReport.find(query)
        .populate('reporter', 'username')
        .populate('reportedUser', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      UserReport.countDocuments(query),
    ]);

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateReportStatus(reportId, updateData) {
    const update = {
      status: updateData.status,
      reviewedAt: new Date(),
      reviewedBy: updateData.adminId,
    };

    if (updateData.actionTaken) {
      update.actionTaken = updateData.actionTaken;
      update.actionDetails = updateData.actionDetails;
    }

    return await UserReport.findByIdAndUpdate(reportId, update, { new: true });
  }
}

module.exports = new UserReportService();
