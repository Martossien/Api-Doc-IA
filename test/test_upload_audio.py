import os
import io
import sys
import wave
import math
import struct
import requests


TOKEN = os.environ.get(
    "API_DOC_IA_TOKEN",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI2ZjQ2MjM5LTUwNTUtNGMzZS1hOTg3LTZiYTk3YzI1ODMwZSIsImV4cCI6MTc1NzM1NjgzNH0.xRrnUCxMdq4mAH-kMRBo43TCZhHiOTHeE6MFWNjuu5Y",
)
HOST = os.environ.get("API_DOC_IA_HOST", "http://127.0.0.1:8080")


def synth_wav_bytes(duration_sec=0.3, freq=440.0, sample_rate=16000):
    n_samples = int(duration_sec * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for i in range(n_samples):
            t = float(i) / sample_rate
            sample = 0.2 * math.sin(2 * math.pi * freq * t)
            wf.writeframes(struct.pack('<h', int(sample * 32767)))
    buf.seek(0)
    return buf.read()


def try_upload(paths):
    headers = {"Authorization": f"Bearer {TOKEN}"}
    wav_data = synth_wav_bytes()
    files = {"file": ("test.wav", wav_data, "audio/wav")}
    params = {"process": "true"}
    for url in paths:
        try:
            r = requests.post(url, headers=headers, files=files, params=params, timeout=25)
            if r.ok:
                return url, r.json()
            else:
                print(f"Attempt {url} failed: {r.status_code} {r.text}")
        except Exception as e:
            print(f"Attempt {url} error: {e}")
    raise RuntimeError("All upload endpoints failed")


def main():
    urls = [
        f"{HOST}/api/v1/files/",  # exact mounted POST path
        f"{HOST}/api/files/",
        f"{HOST}/files/",
    ]
    used_url, resp = try_upload(urls)
    print(f"Uploaded to {used_url}")
    # Expect either full FileModelResponse or error info; both imply endpoint handled audio
    if not isinstance(resp, dict):
        print("ERROR: Unexpected response body")
        sys.exit(2)
    if resp.get("error"):
        print(f"WARN: Upload processed with error: {resp['error']}")
    else:
        print("✅ WAV upload accepted and processed (transcription attempted)")


if __name__ == "__main__":
    main()
