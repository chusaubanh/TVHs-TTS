export function pcmToWav(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF");
  v.setUint32(4, 36 + samples.length * 2, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

export async function streamToWavBlob(
  response: Response,
  sampleRate = 24000,
): Promise<{ blob: Blob; audioBuffer: AudioBuffer }> {
  const ctx = new AudioContext({ sampleRate });
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const chunks: Float32Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const int16 = new Int16Array(value.buffer, value.byteOffset, value.byteLength / 2);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32767.0;
    chunks.push(float32);
    totalLength += float32.length;
  }

  const combined = new Float32Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    combined.set(c, offset);
    offset += c.length;
  }

  const audioBuffer = ctx.createBuffer(1, combined.length, sampleRate);
  audioBuffer.getChannelData(0).set(combined);

  return { blob: pcmToWav(combined, sampleRate), audioBuffer };
}
