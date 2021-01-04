const isDebugEnabled = process.argv.includes('--debug');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  isDebugEnabled,
  devMode
};
