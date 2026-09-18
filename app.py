#!/usr/bin/env python3
"""
WVideoFlow — Smart Video Auto Editor & Silence Remover
Flask backend with SSE progress, persistent background jobs, system resource throttling, and multi-provider AI prompt-to-edit engine.
Author: WVideoFlow Team <wa2latia@gmail.com>
Port: 7070
"""
import os, sys, json, time, subprocess, shutil, threading, tempfile, uuid, re
import urllib.request, urllib.error
from pathlib import Path
from flask import Flask, render_template, request, jsonify, Response, send_file, stream_with_context

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 4096 * 1024 * 1024  # 4GB max upload

WORK_DIR     = Path(__file__).parent.resolve()
UPLOAD_DIR   = WORK_DIR / "uploads"
OUTPUT_DIR   = WORK_DIR / "output"
PREVIEW_DIR  = WORK_DIR / "static" / "previews"
HISTORY_FILE = WORK_DIR / "jobs.json"

for d in [UPLOAD_DIR, OUTPUT_DIR, PREVIEW_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Smart multi-format audio & video extensions
VIDEO_EXT = {'.mp4','.mkv','.avi','.mov','.wmv','.flv','.webm','.m4v','.ts','.mts','.3gp','.ogv','.m2ts','.divx'}
AUDIO_EXT = {'.mp3','.wav','.aac','.m4a','.flac','.ogg','.wma','.opus','.aiff'}
IMAGE_EXT = {'.png','.jpg','.jpeg','.webp','.gif','.bmp','.tiff'}

# ─────────────────────────────────────────────────────────────
# 58 FFmpeg xfade transition catalog
# ─────────────────────────────────────────────────────────────
TRANSITIONS = [
    {"id":"none",        "en":"No Transition",    "ar":"بلا انتقال",       "fr":"Sans transition",    "icon":"⛔","cat":"basic"},
    {"id":"fade",        "en":"Fade",             "ar":"تلاشي",             "fr":"Fondu",              "icon":"🌅","cat":"basic"},
    {"id":"fadeblack",   "en":"Fade Black",       "ar":"سواد تدريجي",       "fr":"Fondu noir",         "icon":"⬛","cat":"basic"},
    {"id":"fadewhite",   "en":"Fade White",       "ar":"بياض تدريجي",       "fr":"Fondu blanc",        "icon":"⬜","cat":"basic"},
    {"id":"dissolve",    "en":"Dissolve",         "ar":"ذوبان",             "fr":"Dissolution",        "icon":"💧","cat":"basic"},
    {"id":"fadefast",    "en":"Fast Fade",        "ar":"تلاشي سريع",        "fr":"Fondu rapide",       "icon":"⚡","cat":"basic"},
    {"id":"fadeslow",    "en":"Slow Fade",        "ar":"تلاشي بطيء",        "fr":"Fondu lent",         "icon":"🐌","cat":"basic"},
    {"id":"wipeleft",    "en":"Wipe Left",        "ar":"مسح يسار",          "fr":"Balayage gauche",    "icon":"⬅️","cat":"wipe"},
    {"id":"wiperight",   "en":"Wipe Right",       "ar":"مسح يمين",          "fr":"Balayage droit",     "icon":"➡️","cat":"wipe"},
    {"id":"wipeup",      "en":"Wipe Up",          "ar":"مسح لأعلى",         "fr":"Balayage haut",      "icon":"⬆️","cat":"wipe"},
    {"id":"wipedown",    "en":"Wipe Down",        "ar":"مسح لأسفل",         "fr":"Balayage bas",       "icon":"⬇️","cat":"wipe"},
    {"id":"wipetl",      "en":"Wipe Top-Left",    "ar":"مسح أعلى يسار",     "fr":"Balayage haut-gauche","icon":"↖️","cat":"wipe"},
    {"id":"wipetr",      "en":"Wipe Top-Right",   "ar":"مسح أعلى يمين",     "fr":"Balayage haut-droit","icon":"↗️","cat":"wipe"},
    {"id":"wipebl",      "en":"Wipe Bot-Left",    "ar":"مسح أسفل يسار",     "fr":"Balayage bas-gauche","icon":"↙️","cat":"wipe"},
    {"id":"wipebr",      "en":"Wipe Bot-Right",   "ar":"مسح أسفل يمين",     "fr":"Balayage bas-droit", "icon":"↘️","cat":"wipe"},
    {"id":"slideleft",   "en":"Slide Left",       "ar":"انزلاق يسار",       "fr":"Glissement gauche",  "icon":"🔀","cat":"slide"},
    {"id":"slideright",  "en":"Slide Right",      "ar":"انزلاق يمين",       "fr":"Glissement droit",   "icon":"🔀","cat":"slide"},
    {"id":"slideup",     "en":"Slide Up",         "ar":"انزلاق لأعلى",      "fr":"Glissement haut",    "icon":"🔀","cat":"slide"},
    {"id":"slidedown",   "en":"Slide Down",       "ar":"انزلاق لأسفل",      "fr":"Glissement bas",     "icon":"🔀","cat":"slide"},
    {"id":"coverleft",   "en":"Cover Left",       "ar":"تغطية يسار",        "fr":"Couvrir gauche",     "icon":"🎴","cat":"slide"},
    {"id":"coverright",  "en":"Cover Right",      "ar":"تغطية يمين",        "fr":"Couvrir droit",      "icon":"🎴","cat":"slide"},
    {"id":"coverup",     "en":"Cover Up",         "ar":"تغطية لأعلى",       "fr":"Couvrir haut",       "icon":"🎴","cat":"slide"},
    {"id":"coverdown",   "en":"Cover Down",       "ar":"تغطية لأسفل",       "fr":"Couvrir bas",        "icon":"🎴","cat":"slide"},
    {"id":"revealleft",  "en":"Reveal Left",      "ar":"كشف يسار",          "fr":"Révéler gauche",     "icon":"🃏","cat":"slide"},
    {"id":"revealright", "en":"Reveal Right",     "ar":"كشف يمين",          "fr":"Révéler droit",      "icon":"🃏","cat":"slide"},
    {"id":"revealup",    "en":"Reveal Up",        "ar":"كشف لأعلى",         "fr":"Révéler haut",       "icon":"🃏","cat":"slide"},
    {"id":"revealdown",  "en":"Reveal Down",      "ar":"كشف لأسفل",         "fr":"Révéler bas",        "icon":"🃏","cat":"slide"},
    {"id":"smoothleft",  "en":"Smooth Left",      "ar":"ناعم يسار",         "fr":"Lisse gauche",       "icon":"🌊","cat":"smooth"},
    {"id":"smoothright", "en":"Smooth Right",     "ar":"ناعم يمين",         "fr":"Lisse droit",        "icon":"🌊","cat":"smooth"},
    {"id":"smoothup",    "en":"Smooth Up",        "ar":"ناعم لأعلى",        "fr":"Lisse haut",         "icon":"🌊","cat":"smooth"},
    {"id":"smoothdown",  "en":"Smooth Down",      "ar":"ناعم لأسفل",        "fr":"Lisse bas",          "icon":"🌊","cat":"smooth"},
    {"id":"circleopen",  "en":"Circle Open",      "ar":"دائرة تفتح",        "fr":"Cercle ouvert",      "icon":"⭕","cat":"shape"},
    {"id":"circleclose", "en":"Circle Close",     "ar":"دائرة تغلق",        "fr":"Cercle fermé",       "icon":"🔴","cat":"shape"},
    {"id":"circlecrop",  "en":"Circle Crop",      "ar":"قص دائري",          "fr":"Recadrage circulaire","icon":"🔵","cat":"shape"},
    {"id":"rectcrop",    "en":"Rect Crop",        "ar":"قص مستطيل",         "fr":"Recadrage rect.",    "icon":"🟦","cat":"shape"},
    {"id":"radial",      "en":"Radial",           "ar":"دوراني",            "fr":"Radial",             "icon":"🌀","cat":"shape"},
    {"id":"diagtl",      "en":"Diagonal TL",      "ar":"قطري أعلى يسار",    "fr":"Diagonal HG",        "icon":"◤","cat":"diagonal"},
    {"id":"diagtr",      "en":"Diagonal TR",      "ar":"قطري أعلى يمين",    "fr":"Diagonal HD",        "icon":"◥","cat":"diagonal"},
    {"id":"diagbl",      "en":"Diagonal BL",      "ar":"قطري أسفل يسار",    "fr":"Diagonal BG",        "icon":"◣","cat":"diagonal"},
    {"id":"diagbr",      "en":"Diagonal BR",      "ar":"قطري أسفل يمين",    "fr":"Diagonal BD",        "icon":"◢","cat":"diagonal"},
    {"id":"zoomin",      "en":"Zoom In",          "ar":"تكبير",             "fr":"Zoom avant",         "icon":"🔍","cat":"special"},
    {"id":"pixelize",    "en":"Pixelize",         "ar":"بكسلة",             "fr":"Pixellisation",      "icon":"🟪","cat":"special"},
    {"id":"hblur",       "en":"H-Blur",           "ar":"ضبابية أفقية",      "fr":"Flou horizontal",    "icon":"🌫️","cat":"special"},
    {"id":"distance",    "en":"Distance",         "ar":"مسافة",             "fr":"Distance",           "icon":"📏","cat":"special"},
    {"id":"fadegrays",   "en":"Fade Grays",       "ar":"تدرج رمادي",        "fr":"Fondu gris",         "icon":"🩶","cat":"special"},
    {"id":"squeezeh",    "en":"Squeeze H",        "ar":"ضغط أفقي",          "fr":"Compression horiz.", "icon":"↔️","cat":"special"},
    {"id":"squeezev",    "en":"Squeeze V",        "ar":"ضغط رأسي",          "fr":"Compression vert.",  "icon":"↕️","cat":"special"},
    {"id":"hlslice",     "en":"H-Left Slice",     "ar":"شريحة يسار",        "fr":"Tranche gauche",     "icon":"🔪","cat":"special"},
    {"id":"hrslice",     "en":"H-Right Slice",    "ar":"شريحة يمين",        "fr":"Tranche droite",     "icon":"🔪","cat":"special"},
    {"id":"vuslice",     "en":"V-Up Slice",       "ar":"شريحة لأعلى",       "fr":"Tranche haut",       "icon":"🔪","cat":"special"},
    {"id":"vdslice",     "en":"V-Down Slice",     "ar":"شريحة لأسفل",       "fr":"Tranche bas",        "icon":"🔪","cat":"special"},
    {"id":"hlwind",      "en":"H-Left Wind",      "ar":"ريح أفقي يسار",     "fr":"Vent gauche",        "icon":"💨","cat":"wind"},
    {"id":"hrwind",      "en":"H-Right Wind",     "ar":"ريح أفقي يمين",     "fr":"Vent droit",         "icon":"💨","cat":"wind"},
    {"id":"vuwind",      "en":"V-Up Wind",        "ar":"ريح رأسي لأعلى",    "fr":"Vent haut",          "icon":"🌬️","cat":"wind"},
    {"id":"vdwind",      "en":"V-Down Wind",      "ar":"ريح رأسي لأسفل",    "fr":"Vent bas",           "icon":"🌬️","cat":"wind"},
    {"id":"vertopen",    "en":"Vert Open",        "ar":"فتح رأسي",          "fr":"Ouverture vert.",    "icon":"📖","cat":"open"},
    {"id":"vertclose",   "en":"Vert Close",       "ar":"إغلاق رأسي",        "fr":"Fermeture vert.",    "icon":"📕","cat":"open"},
    {"id":"horzopen",    "en":"Horz Open",        "ar":"فتح أفقي",          "fr":"Ouverture horiz.",   "icon":"📖","cat":"open"},
    {"id":"horzclose",   "en":"Horz Close",       "ar":"إغلاق أفقي",        "fr":"Fermeture horiz.",   "icon":"📕","cat":"open"},
]

# ─────────────────────────────────────────────────────────────
# Persistent Job Store
# ─────────────────────────────────────────────────────────────
jobs = {}

def load_jobs_from_disk():
    global jobs
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                jobs = json.load(f)
        except Exception as e:
            print(f"⚠️ Error loading jobs.json: {e}")

def save_jobs_to_disk():
    try:
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(jobs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️ Error saving jobs.json: {e}")

load_jobs_from_disk()

# ─────────────────────────────────────────────────────────────
# Resource Monitoring & Throttling Engine
# ─────────────────────────────────────────────────────────────
def get_system_stats():
    if not HAS_PSUTIL:
        return {
            "cpu_percent": 0.0, "memory_percent": 0.0,
            "cpu_cores": os.cpu_count() or 4, "ram_gb": 8.0,
            "throttling_active": False, "status": "Normal"
        }
    cpu_pct = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    is_high = cpu_pct > 70.0 or mem.percent > 70.0
    return {
        "cpu_percent": round(cpu_pct, 1),
        "memory_percent": round(mem.percent, 1),
        "cpu_cores": psutil.cpu_count(logical=True),
        "ram_gb": round(mem.total / (1024**3), 1),
        "ram_avail_gb": round(mem.available / (1024**3), 1),
        "throttling_active": is_high,
        "status": "🍃 Eco Throttling Active (CPU > 70%)" if is_high else "🟢 System Normal"
    }

def get_ffmpeg_thread_args(profile="eco"):
    cores = os.cpu_count() or 4
    if profile == "eco":
        max_t = 1 if cores <= 2 else 2
    elif profile == "balanced":
        max_t = max(1, cores // 2)
    else:
        max_t = max(1, cores - 1)
    
    stats = get_system_stats()
    if stats["throttling_active"]:
        max_t = min(max_t, 2)
        
    return ["-threads", str(max_t)]

def throttle_cpu_if_needed(profile="eco"):
    stats = get_system_stats()
    if stats["cpu_percent"] > 70.0 or stats["memory_percent"] > 70.0 or profile == "eco":
        time.sleep(0.25)
    elif profile == "balanced":
        time.sleep(0.05)

# ─────────────────────────────────────────────────────────────
# AI Prompt-to-Edit Engine (Multi-Provider & Multi-Key Failover)
# ─────────────────────────────────────────────────────────────
AI_SYSTEM_PROMPT = """You are WVideoFlow Studio Engine. Parse the user's natural language instruction for video editing/processing and output a JSON configuration matching WVideoFlow studio settings.

JSON Schema to return (ONLY JSON, NO MARKDOWN, NO OTHER TEXT):
{
  "mode": "master" | "compress" | "silence" | "intro_outro" | "watermark" | "slideshow",
  "remove_silence": true or false,
  "silence_threshold": number between -60 and -10 (default -35),
  "min_silence": number (default 0.7),
  "silence_padding": number (default 0.15),
  "apply_compression": true or false,
  "compress_preset": "handbrake_fast_720p" | "handbrake_very_fast_1080p" | "handbrake_discord" | "handbrake_custom",
  "crf": number between 18 and 32 (default 23),
  "logo_position": "top_right" | "top_left" | "bottom_right" | "bottom_left" | "center" | "animated",
  "logo_opacity": number between 0.1 and 1.0 (default 0.85),
  "logo_scale": number between 0.04 and 0.4 (default 0.12),
  "logo_margin": number (default 20),
  "transition": string transition ID (e.g. "fade", "dissolve", "wipeleft", "circleopen", "zoomin"),
  "transition_duration": number (default 0.6),
  "resource_profile": "eco" | "balanced" | "performance",
  "explanation": "Short 1-2 sentence explanation of what was configured in Arabic/English"
}"""

def _call_llm_provider(prompt, provider, api_key, model_name=""):
    if provider == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        model = model_name or "meta-llama/llama-3.3-70b-instruct:free"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:7070",
            "X-Title": "WVideoFlow",
            "Content-Type": "application/json"
        }
        body = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": AI_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        }
    elif provider == "groq":
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = model_name or "llama-3.3-70b-versatile"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": AI_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        }
    elif provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        model = model_name or "gpt-4o-mini"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": AI_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        }
    elif provider == "gemini":
        model = model_name or "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        body = {
            "contents": [{"parts": [{"text": AI_SYSTEM_PROMPT + "\n\nUser Instruction: " + prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }
    else:
        raise ValueError(f"Unsupported provider: {provider}")

    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=30) as resp:
        res_text = resp.read().decode('utf-8')
        res_data = json.loads(res_text)

    if provider in ("openrouter", "groq", "openai"):
        raw_content = res_data["choices"][0]["message"]["content"]
    elif provider == "gemini":
        raw_content = res_data["candidates"][0]["content"]["parts"][0]["text"]
    else:
        raw_content = "{}"

    raw_content = re.sub(r'^```json\s*', '', raw_content, flags=re.MULTILINE)
    raw_content = re.sub(r'^```\s*', '', raw_content, flags=re.MULTILINE)
    
    return json.loads(raw_content.strip())

@app.route('/api/ai/parse-prompt', methods=['POST'])
def api_ai_parse_prompt():
    data = request.json or {}
    prompt   = data.get("prompt", "").strip()
    provider = data.get("provider", "openrouter").lower()
    keys_raw = data.get("api_keys", "")
    model    = data.get("model", "").strip()

    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400

    if isinstance(keys_raw, list):
        keys = [k.strip() for k in keys_raw if k.strip()]
    else:
        keys = [k.strip() for k in re.split(r'[\n,]+', str(keys_raw)) if k.strip()]

    if not keys:
        return jsonify({"error": "Please provide at least one valid API Key"}), 400

    last_error = None
    for idx, key in enumerate(keys):
        try:
            res_json = _call_llm_provider(prompt, provider, key, model)
            if res_json:
                res_json["used_provider"] = provider
                res_json["used_key_index"] = idx + 1
                return jsonify(res_json)
        except Exception as e:
            print(f"⚠️ Key {idx+1}/{len(keys)} failed for provider '{provider}': {e}")
            last_error = str(e)
            continue

    return jsonify({"error": f"All {len(keys)} API keys failed for '{provider}'. Last error: {last_error}"}), 500

# ─────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/system/stats')
def api_system_stats():
    return jsonify(get_system_stats())

@app.route('/api/transitions')
def api_transitions():
    return jsonify(TRANSITIONS)

@app.route('/api/browse')
def api_browse():
    path = request.args.get('path', str(Path.home()))
    try:
        p = Path(path).resolve()
        if not p.exists(): p = Path.home()
        items = []
        try:
            for item in sorted(p.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
                try:
                    is_dir   = item.is_dir()
                    is_video = not is_dir and item.suffix.lower() in VIDEO_EXT
                    is_audio = not is_dir and item.suffix.lower() in AUDIO_EXT
                    is_image = not is_dir and item.suffix.lower() in IMAGE_EXT
                    if not (is_dir or is_video or is_audio or is_image): continue
                    stat = item.stat()
                    items.append({
                        "name": item.name, "path": str(item),
                        "is_dir": is_dir, "is_video": is_video, "is_audio": is_audio, "is_image": is_image,
                        "size": stat.st_size if not is_dir else 0,
                        "ext": item.suffix.lower()
                    })
                except PermissionError: pass
        except PermissionError: pass
        parent = str(p.parent) if p != p.parent else None
        return jsonify({"current": str(p), "parent": parent, "items": items})
    except Exception as e:
        return jsonify({"current": str(Path.home()), "parent": None, "items": [], "error": str(e)})

@app.route('/api/scan-folder')
def api_scan_folder():
    folder = request.args.get('path', '')
    if not folder or not os.path.isdir(folder):
        return jsonify({"videos": [], "audios": [], "images": [], "count": 0, "error": "Folder not found"})
    videos, audios, images = [], [], []
    for f in sorted(Path(folder).iterdir()):
        if f.is_file():
            stat = f.stat()
            ext = f.suffix.lower()
            info = {
                "name": f.name, "path": str(f),
                "size_mb": round(stat.st_size / 1048576, 1),
                "ext": ext
            }
            if ext in VIDEO_EXT: videos.append(info)
            elif ext in AUDIO_EXT: audios.append(info)
            elif ext in IMAGE_EXT: images.append(info)
    return jsonify({"videos": videos, "audios": audios, "images": images, "count": len(videos) + len(audios) + len(images)})

@app.route('/api/video-info')
def api_video_info():
    path = request.args.get('path', '')
    if not path or not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404
    r = subprocess.run(
        ["ffprobe","-v","quiet","-print_format","json","-show_streams","-show_format", path],
        capture_output=True, text=True)
    if r.returncode != 0:
        return jsonify({"error": "Cannot read video"}), 400
    data = json.loads(r.stdout)
    info = {"path": path, "name": os.path.basename(path)}
    for s in data.get("streams",[]):
        if s.get("codec_type") == "video":
            info["width"] = s.get("width", 0); info["height"] = s.get("height", 0)
            try: info["fps"] = round(eval(s.get("r_frame_rate","25/1")), 2)
            except: info["fps"] = 25
        elif s.get("codec_type") == "audio":
            info["audio_codec"] = s.get("codec_name","")
    fmt = data.get("format",{})
    info["duration"] = round(float(fmt.get("duration",0)), 2)
    info["size_mb"]  = round(int(fmt.get("size",0)) / 1048576, 1)
    return jsonify(info)

@app.route('/api/video/stream')
def api_video_stream():
    path = request.args.get('path','')
    if not path or not os.path.exists(path):
        return jsonify({"error": "not found"}), 404
    range_header = request.headers.get('Range', None)
    fsize = os.path.getsize(path)
    if not range_header:
        return send_file(path, mimetype='video/mp4')
    m = re.search(r'(\d+)-(\d*)', range_header)
    start = int(m.group(1))
    end   = int(m.group(2)) if m.group(2) else fsize - 1
    length = end - start + 1
    def generate():
        with open(path, 'rb') as f:
            f.seek(start)
            remaining = length
            while remaining:
                chunk = min(65536, remaining)
                data = f.read(chunk)
                if not data: break
                yield data
                remaining -= len(data)
    resp = Response(generate(), 206, mimetype='video/mp4',
                    content_type='video/mp4', direct_passthrough=True)
    resp.headers.add('Content-Range', f'bytes {start}-{end}/{fsize}')
    resp.headers.add('Accept-Ranges', 'bytes')
    resp.headers.add('Content-Length', length)
    return resp

@app.route('/api/outputs')
def api_outputs():
    files = []
    if OUTPUT_DIR.exists():
        for f in sorted(OUTPUT_DIR.glob("*.mp4"), key=os.path.getmtime, reverse=True):
            stat = f.stat()
            files.append({
                "name": f.name,
                "path": str(f),
                "url": f"/api/video/stream?path={f}",
                "size_mb": round(stat.st_size / 1048576, 1),
                "mtime": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime))
            })
    return jsonify({"files": files, "count": len(files)})

@app.route('/api/output/delete', methods=['POST'])
def api_output_delete():
    data = request.json or {}
    path = data.get("path", "")
    if path and os.path.exists(path) and str(OUTPUT_DIR) in path:
        try:
            os.remove(path)
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Invalid path"}), 400

@app.route('/api/preview/transition', methods=['POST'])
def api_preview_transition():
    data       = request.json or {}
    transition = data.get("transition", "fade")
    duration   = min(float(data.get("duration", 0.8)), 1.2)

    cached = list(PREVIEW_DIR.glob(f"prev_{transition}_*.mp4"))
    if cached:
        fname = cached[0].name
        return jsonify({"url": f"/static/previews/{fname}", "cached": True})

    out_id   = f"prev_{transition}_{int(time.time())}.mp4"
    out_path = str(PREVIEW_DIR / out_id)
    _gen_transition_preview(out_path, transition, duration)
    if os.path.exists(out_path):
        return jsonify({"url": f"/static/previews/{out_id}"})
    return jsonify({"error": "Preview generation failed"}), 500

def _gen_transition_preview(out_path, transition, td=0.8):
    clip_dur = 1.5
    td = min(td, 0.9)
    offset = clip_dur - td
    c1, c2 = "0x1a5fa8", "0xa83e1a"
    if transition == "none":
        fc = (f"color=c={c1}:s=480x270:r=25:d={clip_dur},drawtext=text='Clip A':fontsize=40:fontcolor=white:x=(w-tw)/2:y=(h-th)/2[a];"
              f"color=c={c2}:s=480x270:r=25:d={clip_dur},drawtext=text='Clip B':fontsize=40:fontcolor=white:x=(w-tw)/2:y=(h-th)/2[b];"
              f"[a][b]concat=n=2:v=1:a=0")
    else:
        fc = (f"color=c={c1}:s=480x270:r=25:d={clip_dur},drawtext=text='Clip A':fontsize=40:fontcolor=white:x=(w-tw)/2:y=(h-th)/2[a];"
              f"color=c={c2}:s=480x270:r=25:d={clip_dur},drawtext=text='Clip B':fontsize=40:fontcolor=white:x=(w-tw)/2:y=(h-th)/2[b];"
              f"[a][b]xfade=transition={transition}:duration={td}:offset={offset:.3f}")
    
    t_args = get_ffmpeg_thread_args("eco")
    subprocess.run([
        "ffmpeg","-y","-hide_banner","-loglevel","error"
    ] + t_args + [
        "-filter_complex", fc,
        "-c:v","libx264","-crf","28","-preset","ultrafast",
        "-t", str(clip_dur*2), out_path
    ], capture_output=True)

@app.route('/api/preview/all-transitions', methods=['POST'])
def api_preview_all():
    def generate_all():
        td = 0.7
        for t in TRANSITIONS:
            tid = t["id"]
            existing = list(PREVIEW_DIR.glob(f"prev_{tid}_*.mp4"))
            if not existing:
                out_path = str(PREVIEW_DIR / f"prev_{tid}_{int(time.time())}.mp4")
                _gen_transition_preview(out_path, tid, td)
                time.sleep(0.1)
    threading.Thread(target=generate_all, daemon=True).start()
    return jsonify({"status": "generating", "count": len(TRANSITIONS)})

# ─────────────────────────────────────────────────────────────
# Persistent Job Processing Engine
# ─────────────────────────────────────────────────────────────
@app.route('/api/process', methods=['POST'])
def api_process():
    cfg    = request.json or {}
    job_id = f"job_{int(time.time())}_{str(uuid.uuid4())[:4]}"
    profile = cfg.get("resource_profile", "eco")
    mode    = cfg.get("mode", "master")
    
    jobs[job_id] = {
        "job_id": job_id,
        "mode": mode,
        "status": "pending",
        "progress": 0,
        "total": 0,
        "current_file": "",
        "log": [],
        "output": cfg.get("output_folder", str(OUTPUT_DIR)),
        "start_time": time.time(),
        "elapsed": 0,
        "resource_profile": profile,
        "results": []
    }
    save_jobs_to_disk()
    threading.Thread(target=_run_job, args=(job_id, cfg), daemon=True).start()
    return jsonify({"job_id": job_id})

@app.route('/api/job/active')
def api_job_active():
    for jid, j in sorted(jobs.items(), key=lambda x: x[1].get("start_time", 0), reverse=True):
        if j.get("status") == "running":
            j_copy = dict(j)
            j_copy["elapsed"] = round(time.time() - j["start_time"])
            return jsonify({"has_active": True, "job": j_copy})
    return jsonify({"has_active": False})

@app.route('/api/job/<job_id>')
def api_job_status(job_id):
    if job_id not in jobs: return jsonify({"error": "Not found"}), 404
    j = dict(jobs[job_id])
    if j["status"] == "running":
        j["elapsed"] = round(time.time() - j["start_time"])
    return jsonify(j)

@app.route('/api/history')
def api_history():
    sorted_jobs = sorted(jobs.values(), key=lambda x: x.get("start_time", 0), reverse=True)
    return jsonify({"history": sorted_jobs[:30]})

@app.route('/api/job/<job_id>/stream')
def api_job_stream(job_id):
    def generate():
        sent = 0
        while True:
            if job_id not in jobs:
                yield f"data: {json.dumps({'error':'not found'})}\n\n"; break
            j = jobs[job_id]
            stats = get_system_stats()
            payload = {
                "job_id":   job_id,
                "status":   j["status"],
                "progress": j["progress"],
                "total":    j["total"],
                "current_file": j.get("current_file",""),
                "new_logs": j["log"][sent:],
                "elapsed":  round(time.time() - j["start_time"]) if j["status"]=="running" else j.get("elapsed",0),
                "output":   j.get("output",""),
                "system_stats": stats
            }
            sent = len(j["log"])
            yield f"data: {json.dumps(payload)}\n\n"
            if j["status"] in ("done","error"): break
            time.sleep(0.5)
    return Response(stream_with_context(generate()), content_type='text/event-stream',
                    headers={'Cache-Control':'no-cache','X-Accel-Buffering':'no'})

def _log(jid, msg, level="info"):
    if jid in jobs:
        jobs[jid]["log"].append({"ts": time.strftime("%H:%M:%S"), "msg": msg, "level": level})

def _run_job(job_id, cfg):
    j = jobs[job_id]
    j["status"] = "running"
    profile = cfg.get("resource_profile", "eco")
    mode    = cfg.get("mode", "master")
    save_jobs_to_disk()
    
    try:
        out_dir = Path(cfg.get("output_folder") or str(OUTPUT_DIR))
        out_dir.mkdir(parents=True, exist_ok=True)

        if mode == "slideshow":
            images = cfg.get("images", [])
            if not images:
                _log(job_id, "No images selected for photo slideshow album", "error")
                j["status"] = "error"; save_jobs_to_disk(); return
            
            j["total"] = 1
            j["current_file"] = "Photo_Slideshow_Album.mp4"
            dst = str(out_dir / f"Photo_Album_{int(time.time())}.mp4")

            _log(job_id, f"🖼️ Creating Photo Album Slideshow from {len(images)} images...")
            if _create_slideshow(job_id, images, cfg.get("audio_track",""), dst,
                                 float(cfg.get("slide_duration", 3.0)), cfg.get("transition","fade"), profile):
                _log(job_id, f"✅ Photo Album Created: {Path(dst).name}", "success")
                j["progress"] = 1
                j["status"] = "done"
            else:
                _log(job_id, "❌ Failed to create photo album", "error")
                j["status"] = "error"
            save_jobs_to_disk()
            return

        videos = cfg.get("videos", [])
        if not videos:
            _log(job_id, "No videos selected for processing", "error")
            j["status"] = "error"
            save_jobs_to_disk()
            return

        j["total"] = len(videos)
        _log(job_id, f"🚀 WVideoFlow Engine Started [Mode: {mode.upper()}] for {len(videos)} video(s)")
        _log(job_id, f"🍃 Resource Profile: {profile.upper()} | Cores: {os.cpu_count() or 4}")

        ok_count = 0
        for idx, vpath in enumerate(videos):
            vname = os.path.basename(vpath)
            j["current_file"] = vname
            j["progress"] = idx

            _log(job_id, f"[{idx+1}/{len(videos)}] Processing: {vname}")
            dst = str(out_dir / f"{Path(vpath).stem}_{mode}_WVideoFlow.mp4")

            throttle_cpu_if_needed(profile)
            res = _process_single(job_id, vpath, dst, cfg, profile)
            if res["success"]:
                _log(job_id, f"✅ Completed: {Path(dst).name}", "success")
                ok_count += 1
                j.setdefault("results", []).append({"file": Path(dst).name, "path": dst})
            else:
                _log(job_id, f"❌ Failed: {vname}", "error")
            
            save_jobs_to_disk()

        j["progress"] = len(videos)
        elapsed = round(time.time() - j["start_time"])
        _log(job_id, f"🎉 Job Finished! {ok_count}/{len(videos)} processed in {elapsed}s", "success")
        j["status"] = "done"
        j["elapsed"] = elapsed
        save_jobs_to_disk()

    except Exception as e:
        _log(job_id, f"Fatal engine error: {e}", "error")
        j["status"] = "error"
        save_jobs_to_disk()

def _process_single(jid, src, dst, cfg, profile="eco"):
    res = {"success": False, "silence_saved": 0.0}
    mode = cfg.get("mode", "master")
    try:
        with tempfile.TemporaryDirectory() as tmp:
            cur = src

            if mode == "compress" or cfg.get("apply_compression", False):
                preset = cfg.get("compress_preset", "handbrake_fast_720p")
                crf    = int(cfg.get("crf", 23))
                scale  = cfg.get("scale", "-2:720")
                _log(jid, f"  🗜️ Compressing video ({preset} / CRF={crf})...")
                comp_out = f"{tmp}/comp.mp4"
                if _compress_video(cur, comp_out, crf, scale, profile):
                    cur = comp_out

            if mode in ("silence", "master") and cfg.get("remove_silence", True):
                _log(jid, "  🔇 Detecting silence...")
                ns = f"{tmp}/1_ns.mp4"
                orig_dur = _dur(cur)
                throttle_cpu_if_needed(profile)
                if _rm_silence(cur, ns, float(cfg.get("silence_threshold", -35)),
                               float(cfg.get("min_silence", 0.7)), float(cfg.get("silence_padding", 0.15)), profile):
                    if os.path.exists(ns) and os.path.getsize(ns) > 500:
                        saved = round(orig_dur - _dur(ns), 1)
                        res["silence_saved"] = max(0.0, saved)
                        _log(jid, f"  ✂️ Trimmed {saved}s silence")
                        cur = ns

            intro = cfg.get("intro", ""); outro = cfg.get("outro", "")
            if mode in ("intro_outro", "master") and (intro or outro):
                _log(jid, "  🎬 Merging Intro/Outro with transitions...")
                io = f"{tmp}/2_io.mp4"
                throttle_cpu_if_needed(profile)
                if _add_io(cur, io, intro or None, outro or None,
                           cfg.get("transition", "fade"), float(cfg.get("transition_duration", 0.6)), profile):
                    if os.path.exists(io) and os.path.getsize(io) > 500: cur = io

            logo = cfg.get("logo", "")
            if mode in ("watermark", "master") and logo and os.path.exists(logo):
                _log(jid, f"  🔖 Overlaying Watermark ({cfg.get('logo_position','top_right')})...")
                lv = f"{tmp}/3_logo.mp4"
                throttle_cpu_if_needed(profile)
                if _add_logo(cur, lv, logo, cfg.get("logo_position", "top_right"),
                             float(cfg.get("logo_opacity", 0.85)), float(cfg.get("logo_scale", 0.12)),
                             int(cfg.get("logo_margin", 20)), profile):
                    if os.path.exists(lv) and os.path.getsize(lv) > 500: cur = lv

            shutil.copy2(cur, dst)
            res["success"] = os.path.exists(dst) and os.path.getsize(dst) > 500
            return res
    except Exception as e:
        _log(jid, f"  ⚠️ Exception: {e}", "error")
        return res

# ─────────────────────────────────────────────────────────────
# Advanced FFmpeg Helper Engine
# ─────────────────────────────────────────────────────────────
def _dur(path):
    r = subprocess.run(["ffprobe","-v","quiet","-show_entries","format=duration","-of","csv=p=0", path],
                       capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except: return 0.0

def _dims(path):
    r = subprocess.run(["ffprobe","-v","quiet","-print_format","json","-show_streams", path],
                       capture_output=True, text=True)
    try:
        for s in json.loads(r.stdout).get("streams",[]):
            if s.get("codec_type")=="video":
                fps=25
                try: fps=round(eval(s.get("r_frame_rate","25/1")),3)
                except: pass
                return s.get("width",1280), s.get("height",720), fps
    except: pass
    return 1280, 720, 25

def _ff(args, profile="eco"):
    t_args = get_ffmpeg_thread_args(profile)
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"] + t_args + args
    r = subprocess.run(cmd, capture_output=True)
    return r.returncode == 0

def _compress_video(src, dst, crf=23, scale="-2:720", profile="eco"):
    vf = f"scale={scale}" if scale and scale != "none" else "null"
    return _ff(["-i", src, "-vf", vf, "-c:v", "libx264", "-crf", str(crf), "-preset", "fast",
                "-c:a", "aac", "-b:a", "128k", dst], profile)

def _create_slideshow(jid, images, audio_track, dst, slide_dur=3.0, transition="fade", profile="eco"):
    with tempfile.TemporaryDirectory() as tmp:
        norm_clips = []
        for i, img in enumerate(images):
            out_clip = f"{tmp}/slide_{i:03d}.mp4"
            vf = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black"
            cmd = ["-loop", "1", "-i", img, "-vf", vf, "-c:v", "libx264", "-t", str(slide_dur),
                   "-pix_fmt", "yuv420p", out_clip]
            if _ff(cmd, profile) and os.path.exists(out_clip):
                norm_clips.append(out_clip)
        
        if not norm_clips: return False
        
        merged_slides = f"{tmp}/slides_merged.mp4"
        cl = f"{tmp}/slides.txt"
        with open(cl, 'w') as f:
            for p in norm_clips: f.write(f"file '{p}'\n")
        
        _ff(["-f", "concat", "-safe", "0", "-i", cl, "-c", "copy", merged_slides], profile)

        if audio_track and os.path.exists(audio_track):
            return _ff(["-i", merged_slides, "-i", audio_track, "-c:v", "copy",
                        "-c:a", "aac", "-b:a", "192k", "-shortest", dst], profile)
        else:
            shutil.copy2(merged_slides, dst)
            return True

def _rm_silence(src, dst, thr=-35, mind=0.7, pad=0.15, profile="eco"):
    t_args = get_ffmpeg_thread_args(profile)
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner"] + t_args + [
        "-i", src, "-af", f"silencedetect=noise={thr}dB:d={mind}", "-f", "null", "-"
    ], capture_output=True, text=True)

    silences, ss = [], None
    for line in r.stderr.split('\n'):
        if 'silence_start' in line:
            try: ss = float(line.split('silence_start:')[1].strip().split()[0])
            except: pass
        elif 'silence_end' in line and ss is not None:
            try:
                se = float(line.split('silence_end:')[1].strip().split()[0])
                silences.append((ss, se)); ss = None
            except: pass

    if not silences:
        shutil.copy2(src, dst)
        return True

    dur = _dur(src); keep = []; prev = 0.0
    for ss2, se in silences:
        if ss2 + pad > prev + 0.05: keep.append((prev, min(dur, ss2 + pad)))
        prev = max(prev, se - pad)
    if prev < dur - 0.05: keep.append((prev, dur))
    if not keep:
        shutil.copy2(src, dst)
        return True

    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for i, (s, e) in enumerate(keep):
            if e - s < 0.05: continue
            o = f"{tmp}/s{i:04d}.mp4"
            if _ff(["-ss", str(s), "-i", src, "-t", str(e - s),
                    "-c:v", "libx264", "-crf", "20", "-preset", "fast",
                    "-c:a", "aac", "-b:a", "192k",
                    "-avoid_negative_ts", "make_zero", o], profile) and os.path.getsize(o) > 500:
                parts.append(o)
                throttle_cpu_if_needed(profile)

        if not parts:
            shutil.copy2(src, dst)
            return True

        cl = f"{tmp}/list.txt"
        with open(cl, 'w') as f:
            for p in parts: f.write(f"file '{p}'\n")

        return _ff(["-f", "concat", "-safe", "0", "-i", cl, "-c", "copy", dst], profile)

def _norm_clip(src, dst, W, H, FPS, profile="eco"):
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
          f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:black,fps={FPS:.3f}")
    return _ff(["-i", src, "-vf", vf, "-c:v", "libx264", "-crf", "20", "-preset", "fast",
                "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2", dst], profile)

def _add_io(main, dst, intro, outro, transition="fade", td=0.6, profile="eco"):
    W, H, FPS = _dims(main)
    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        if intro and os.path.exists(intro):
            p = f"{tmp}/i.mp4"
            if _norm_clip(intro, p, W, H, FPS, profile) and os.path.exists(p): parts.append(p)
        mn = f"{tmp}/m.mp4"
        if _norm_clip(str(main), mn, W, H, FPS, profile) and os.path.exists(mn): parts.append(mn)
        else: parts.append(str(main))
        if outro and os.path.exists(outro):
            p = f"{tmp}/o.mp4"
            if _norm_clip(outro, p, W, H, FPS, profile) and os.path.exists(p): parts.append(p)

        if len(parts) == 1:
            shutil.copy2(parts[0], dst)
            return True

        if transition and transition != "none" and len(parts) >= 2:
            if _xfade_concat(parts, dst, transition, td, profile): return True

        cl = f"{tmp}/list.txt"
        with open(cl, 'w') as f:
            for p in parts: f.write(f"file '{p}'\n")
        return _ff(["-f", "concat", "-safe", "0", "-i", cl, "-c", "copy", dst], profile)

def _xfade_concat(parts, dst, transition, td, profile="eco"):
    inputs = []
    for p in parts: inputs += ["-i", p]
    durations = [_dur(p) for p in parts]
    fc_parts = []; cur_v = "[0:v]"; cur_a = "[0:a]"; offset = 0.0
    for i in range(1, len(parts)):
        offset += max(0.1, durations[i-1] - td)
        nv = f"[v{i}]" if i < len(parts) - 1 else "[vout]"
        na = f"[a{i}]" if i < len(parts) - 1 else "[aout]"
        fc_parts.append(f"{cur_v}[{i}:v]xfade=transition={transition}:duration={td}:offset={offset:.3f}{nv}")
        fc_parts.append(f"{cur_a}[{i}:a]acrossfade=d={td}{na}")
        cur_v = nv; cur_a = na
    fc = ";".join(fc_parts)
    return _ff(inputs + ["-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
                         "-c:v", "libx264", "-crf", "20", "-preset", "fast", "-c:a", "aac", "-b:a", "192k", dst], profile)

def _add_logo(src, dst, logo, pos="top_right", opacity=0.85, scale=0.12, margin=20, profile="eco"):
    if pos == "animated":
        ov = f"(W-w)/2+(W-w-2*{margin})/2*cos(t*0.5):(H-h)/2+(H-h-2*{margin})/2*sin(t*0.5)"
    else:
        POS = {"top_left": f"{margin}:{margin}", "top_right": f"W-w-{margin}:{margin}",
               "bottom_left": f"{margin}:H-h-{margin}", "bottom_right": f"W-w-{margin}:H-h-{margin}", "center": "(W-w)/2:(H-h)/2"}
        ov = POS.get(pos, POS["top_right"])
        
    fc = (f"[1:v]scale=iw*{scale}:-1,format=rgba,colorchannelmixer=aa={opacity}[lg];"
          f"[0:v][lg]overlay={ov}:format=auto")
    return _ff(["-i", str(src), "-i", str(logo), "-filter_complex", fc,
                "-c:v", "libx264", "-crf", "22", "-preset", "fast", "-c:a", "copy", dst], profile)

# ─────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 7070))
    print(f"\n{'='*60}")
    print(f"  🎬 WVideoFlow — Smart Video Auto Editor & Silence Remover")
    print(f"  📧 Maintainer: WVideoFlow Team <wa2latia@gmail.com>")
    print(f"  🤖 Multi-Provider AI Engine: OpenRouter, Gemini, Groq, OpenAI (Multi-Keys Supported)")
    print(f"  🍃 Low-Resource Mode: Enabled (psutil detected: {HAS_PSUTIL})")
    print(f"  🌐 http://localhost:{port}")
    print(f"{'='*60}\n")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
