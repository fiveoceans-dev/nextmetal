// controllers/user.ctrl.js

exports.me = (req, res) => res.json(pickPublic(req.user));