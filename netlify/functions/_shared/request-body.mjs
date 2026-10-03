export async function readBoundedJson(request, limit = 24000) {
  const declared = Number(request.headers.get('content-length'));
  if (declared > limit) return { status: 413 };
  const reader = request.body?.getReader();
  if (!reader) return { status: 400 };
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0, raw = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) { await reader.cancel(); return { status: 413 }; }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400 };
    return { body };
  } catch {
    return { status: 400 };
  } finally {
    reader.releaseLock();
  }
}
