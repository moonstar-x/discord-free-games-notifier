const DEBUG_ENABLED = process.argv.includes('--debug');

const DEV_MODE = process.env.NODE_ENV === 'development';

module.exports = {
  DEBUG_ENABLED,
  DEV_MODE
};
