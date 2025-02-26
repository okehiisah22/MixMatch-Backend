/**
 * @description ExpressJS controller wrapper for error handling
 *
 * @param fn
 * @returns {Function} - a callback that executes the controller
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
