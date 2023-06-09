/**
 * Authorization middleware (only admin and moderator are allowed)
 * @param {string} roles
 * @returns
 */
module.exports = function restrictTo(roles) {
  return function (req, res, next) {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
};
