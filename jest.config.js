const config = {
  testPathIgnorePatterns: ["/node_modules/", "/fixtures/"]
};

if (process.env.NODE_ENV === "test:integration") {
  config["preset"] = "jest-puppeteer";
}

module.exports = config;
