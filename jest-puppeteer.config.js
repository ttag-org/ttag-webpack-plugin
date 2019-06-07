// jest-puppeteer.config.js
const PORT = 4444;

module.exports = {
  server: {
    command: `ws --port ${PORT} --directory ./tests-integration/fixtures/example`,
    port: PORT
  }
};
