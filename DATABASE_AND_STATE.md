# 💾 WVideoFlow Data Schemas & State Management Guide

## 📌 Data Architecture Overview

WVideoFlow follows a lightweight, serverless JSON & LocalStorage data architecture:
1. **Server Storage (`jobs.json`)**: Persistent JSON database storing job history, SSE logs, output paths, and execution timestamps.
2. **Browser Storage (`localStorage`)**: Stores user UI preferences (`wv_settings`) and AI provider keys (`wv_ai_config`).

---

## 1. Server Persistent Store: `jobs.json`

Location: `/opt/web-app/web-app/video-editor/jobs.json`

### JSON Schema Specification:
```json
{
  "job_1789759200_a1b2": {
    "job_id": "job_1789759200_a1b2",
    "mode": "master",
    "status": "done",
    "progress": 3,
    "total": 3,
    "current_file": "video3.mp4",
    "output": "/opt/web-app/web-app/video-editor/output",
    "start_time": 1789759200.0,
    "elapsed": 45,
    "resource_profile": "eco",
    "log": [
      {"ts": "22:00:00", "msg": "🚀 WVideoFlow Engine Started [Mode: MASTER] for 3 video(s)", "level": "info"},
      {"ts": "22:00:05", "msg": "  🔇 Detecting silence...", "level": "info"},
      {"ts": "22:00:20", "msg": "  ✂️ Trimmed 4.2s silence", "level": "info"},
      {"ts": "22:00:45", "msg": "🎉 Job Finished! 3/3 processed in 45s", "level": "success"}
    ],
    "results": [
      {"file": "video1_master_WVideoFlow.mp4", "path": "/opt/web-app/web-app/video-editor/output/video1_master_WVideoFlow.mp4"},
      {"file": "video2_master_WVideoFlow.mp4", "path": "/opt/web-app/web-app/video-editor/output/video2_master_WVideoFlow.mp4"}
    ]
  }
}
```

---

## 2. Browser Storage: `localStorage`

### A. Studio Settings: `wv_settings`
Key: `wv_settings`

```json
{
  "mode": "master",
  "inputFolder": "/home/user/Videos",
  "outputFolder": "/home/user/Videos/Output",
  "resourceProfile": "eco",
  "compressPreset": "handbrake_fast_720p",
  "crf": "23",
  "silenceEnabled": true,
  "silenceThreshold": "-35",
  "minSilence": "0.7",
  "silencePadding": "0.15",
  "logoPosition": "top_right",
  "logoOpacity": "0.85",
  "logoScale": "0.12",
  "logoMargin": 20,
  "selectedTransition": "fade",
  "transitionDuration": "0.6",
  "slideDur": "3.0"
}
```

### B. AI Configuration & Key Pool: `wv_ai_config`
Key: `wv_ai_config`

```json
{
  "provider": "openrouter",
  "keys": "sk-or-v1-key1...\nsk-or-v1-key2...",
  "model": "meta-llama/llama-3.3-70b-instruct:free"
}
```

---

## 3. Server-Sent Events (SSE) Stream Payload (`/api/job/<job_id>/stream`)

```json
{
  "job_id": "job_1789759200_a1b2",
  "status": "running",
  "progress": 1,
  "total": 3,
  "current_file": "lesson_part1.mp4",
  "elapsed": 14,
  "output": "/opt/web-app/web-app/video-editor/output",
  "system_stats": {
    "cpu_percent": 42.5,
    "memory_percent": 55.1,
    "cpu_cores": 4,
    "ram_gb": 16.0,
    "throttling_active": false,
    "status": "🟢 System Normal"
  },
  "new_logs": [
    {"ts": "22:00:14", "msg": "  🔖 Overlaying Watermark (top_right)...", "level": "info"}
  ]
}
```

---

## 4. AI Prompt Parser Response Payload (`/api/ai/parse-prompt`)

```json
{
  "mode": "master",
  "remove_silence": true,
  "silence_threshold": -35,
  "min_silence": 0.7,
  "silence_padding": 0.15,
  "apply_compression": true,
  "compress_preset": "handbrake_fast_720p",
  "crf": 23,
  "logo_position": "top_right",
  "logo_opacity": 0.85,
  "logo_scale": 0.12,
  "logo_margin": 20,
  "transition": "fade",
  "transition_duration": 0.6,
  "resource_profile": "eco",
  "explanation": "تم ضبط وضع المونتاج الشامل مع تقطيع الصمت عند -35 ديسيبل وضغط دقة 720p وشعار أعلى اليمين.",
  "used_provider": "openrouter",
  "used_key_index": 1
}
```
