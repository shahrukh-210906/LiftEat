const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const gemini = require('../services/gemini');
test('Gemini sends server credentials and maps history; rejects failed or blocked output', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key';
  let sent;
  const stub = mock.method(global, 'fetch', async (url, options) => {
    sent = { url, options };
    return { ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Hello' }] } }] }) };
  });
  try {
    const request = { system: 'User records', messages: [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Welcome' }] };
    assert.equal(await gemini.generate(request), 'Hello');
    assert.equal(sent.options.headers['x-goog-api-key'], 'test-key');
    assert.ok(!sent.url.includes('test-key'));
    const body = JSON.parse(sent.options.body);
    assert.equal(body.contents[1].role, 'model');
    assert.equal(body.systemInstruction.parts[0].text, 'User records');
    stub.mock.mockImplementation(async () => ({ ok: false }));
    await assert.rejects(gemini.generate(request), /GEMINI_REQUEST_FAILED/);
    stub.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ candidates: [] }) }));
    await assert.rejects(gemini.generate(request), /GEMINI_EMPTY_OR_INCOMPLETE/);
  } finally {
    stub.mock.restore();
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});
