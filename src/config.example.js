const env = process.env.NODE_ENV || 'dev'; // 'dev' or 'test'

const dev = {
  app: {
    port: parseInt(process.env.APP_PORT) || 8000,
    logLevel: 'info'
  }
};
const test = {
  app: {
    port: parseInt(process.env.APP_PORT) || 8000,
    logLevel: 'info'
  }
};

const config = {
  dev,
  test
};

module.exports = config[env];
