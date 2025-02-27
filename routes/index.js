const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingsRoutes');
const contractsRoutes = require('./contractsRoutes');
const invoicesRoutes = require('./invoicesRoutes');
const automatedInvoiceRoutes = require('./automatedInvoiceRoutes');
const automatedContractsRoutes = require('./automatedContractsRoutes');

module.exports = {
  userRoutes,
  bookingRoutes,
  authRoutes,
  contractsRoutes,
  invoicesRoutes,
  automatedInvoiceRoutes,
  automatedContractsRoutes,
};
