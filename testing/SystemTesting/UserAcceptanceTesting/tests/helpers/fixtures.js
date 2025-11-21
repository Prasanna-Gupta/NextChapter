// tests/helpers/fixtures.js
const { test: base, expect, request } = require('@playwright/test');

const test = base.extend({
  apiRequest: async ({ baseURL }, use) => {
    const req = await request.newContext({
      baseURL: process.env.MODERATION_API_URL || baseURL
    });
    await use(req);
    await req.dispose();
  }
});

module.exports = { test, expect };
