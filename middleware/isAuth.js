const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1]; // 0=Bearer | 1=Token
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SOMESUPERSECRET_KEY);
  } catch (err) {
    req.isAuth = false;
    throw err;
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next()
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
}
