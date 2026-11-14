const { app } = require('../server/dist/app.js');

module.exports = (req, res) => {
  let targetUrl = req.url || '/api';

  // Check headers for Vercel matched path
  if (req.headers && req.headers['x-matched-path'] && req.headers['x-matched-path'].startsWith('/api')) {
    const matched = req.headers['x-matched-path'];
    const qIdx = targetUrl.indexOf('?');
    const query = qIdx !== -1 ? targetUrl.slice(qIdx) : '';
    targetUrl = matched + query;
  } else if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    targetUrl = req.originalUrl;
  } else if (req.query && req.query.path) {
    const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    const qIdx = targetUrl.indexOf('?');
    const query = qIdx !== -1 ? targetUrl.slice(qIdx) : '';
    targetUrl = `/api/${subpath}${query}`;
  } else if (!targetUrl.startsWith('/api')) {
    targetUrl = '/api' + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
  }

  req.url = targetUrl;
  return app(req, res);
};
