const SUPPORTED = new Set(['image/jpeg', 'image/png', 'image/webp']);

function hasImageSignature(buffer, mimeType) {
  if (mimeType === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === 'image/webp') return buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
  return false;
}

async function analyze({ buffer, mimeType, filename }) {
  const baseUrl = process.env.VISION_SERVICE_URL?.replace(/\/$/, '');
  const token = process.env.VISION_SERVICE_TOKEN;
  if (!baseUrl || !token) throw new Error('VISION_NOT_CONFIGURED');
  const form = new FormData();
  form.append('image', new Blob([buffer], { type: mimeType }), filename || 'meal');
  const response = await fetch(`${baseUrl}/v1/meals/analyze`, {
    method: 'POST',
    headers: { 'x-service-token': token },
    body: form,
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) {
    const error = new Error(response.status === 422 ? 'VISION_NO_MEAL' : 'VISION_REQUEST_FAILED');
    throw error;
  }
  return response.json();
}

module.exports = { analyze, hasImageSignature, SUPPORTED };
