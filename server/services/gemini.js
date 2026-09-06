async function generate({ system, messages, schema, images = [] }) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_NOT_CONFIGURED');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || 'gemini-2.5-flash')}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m, index) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [
        { text: m.content },
        ...(index === messages.length - 1 ? images.map(image => ({ inlineData: { mimeType: image.mimeType, data: image.data } })) : []),
      ] })),
      generationConfig: { maxOutputTokens: 4096, ...(schema ? { responseMimeType: 'application/json', responseJsonSchema: schema } : {}) } }),
  });
  if (!response.ok) throw new Error('GEMINI_REQUEST_FAILED');
  const result = await response.json();
  const candidate = result.candidates?.[0];
  const text = candidate?.content?.parts?.filter(p => !p.thought).map(p => p.text || '').join('').trim();
  if (!text || candidate.finishReason !== 'STOP') throw new Error('GEMINI_EMPTY_OR_INCOMPLETE');
  return text;
}
module.exports = { generate };
