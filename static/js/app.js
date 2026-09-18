/* ═══════════════════════════════════════════════════
   WVideoFlow — Main App Logic (app.js)
   Author: WVideoFlow Team <wa2latia@gmail.com>
   ═══════════════════════════════════════════════════ */

// ─── State ───
const state = {
  mode: 'master', // 'master' | 'compress' | 'silence' | 'intro_outro' | 'watermark' | 'slideshow'
  inputFolder: '', outputFolder: '',
  intro: '', outro: '', logo: '', slideshowAudio: '',
  videos: [],          // all scanned videos
  images: [],          // scanned images
  audios: [],          // scanned audios
  selectedVideos: [],  // checked for processing
  selectedTransition: 'fade',
  resourceProfile: 'eco', // 'eco' | 'balanced' | 'performance'
  jobId: null,
  jobStream: null,
};

// ─── Browser context ───
let browserContext = null;  // 'inputFolder' | 'outputFolder' | 'intro' | 'outro' | 'logo' | 'slideshowAudio'
let browserCurrentPath = '';
let browserParent = '';
let browserSelectedItem = null;

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  initWelcomeModal();
  initTabNav();
  initTransitions();
  initSilenceToggle();
  initSystemMonitor();
  onWorkflowModeChange('master');
  loadSettingsFromStorage();
  loadAiKeysConfig();
  attachAutoSaveListeners();
  checkActiveBackgroundJob();
});

// ═══ WELCOME INTRO MODAL ═══
function initWelcomeModal() {
  const agreed = localStorage.getItem('vf_agreed');
  const modal = document.getElementById('welcomeModal');
  if (agreed === 'true') {
    modal.classList.remove('open');
  } else {
    modal.classList.add('open');
  }
}

function agreeAndStart() {
  localStorage.setItem('vf_agreed', 'true');
  document.getElementById('welcomeModal').classList.remove('open');
  showToast('Welcome to WVideoFlow Studio! 🎬', 'success');
}

function openWelcomeModal() {
  document.getElementById('welcomeModal').classList.add('open');
}

// ═══ AUTO-SAVE & RESTORE DEFAULT SETTINGS ═══
function saveAllSettingsToStorage() {
  const data = {
    mode: state.mode,
    inputFolder: document.getElementById('inputFolderPath')?.value || '',
    outputFolder: document.getElementById('outputFolderPath')?.value || '',
    resourceProfile: state.resourceProfile,
    compressPreset: document.getElementById('compressPreset')?.value || 'handbrake_fast_720p',
    crf: document.getElementById('crfRange')?.value || 23,
    silenceEnabled: document.getElementById('silenceEnabled')?.checked ?? true,
    silenceThreshold: document.getElementById('silenceThreshold')?.value || -35,
    minSilence: document.getElementById('minSilence')?.value || 0.7,
    silencePadding: document.getElementById('silencePadding')?.value || 0.15,
    logoPosition: document.getElementById('logoPosition')?.value || 'top_right',
    logoOpacity: document.getElementById('logoOpacity')?.value || 0.85,
    logoScale: document.getElementById('logoScale')?.value || 0.12,
    logoMargin: document.getElementById('logoMargin')?.value || 20,
    selectedTransition: state.selectedTransition,
    transitionDuration: document.getElementById('transitionDuration')?.value || 0.6,
    slideDur: document.getElementById('slideDurRange')?.value || 3.0,
  };
  localStorage.setItem('wv_settings', JSON.stringify(data));
}

function loadSettingsFromStorage() {
  const raw = localStorage.getItem('wv_settings');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (data.mode) {
      document.getElementById('workflowModeSelect').value = data.mode;
      state.mode = data.mode;
    }
    if (data.inputFolder) {
      document.getElementById('inputFolderPath').value = data.inputFolder;
      state.inputFolder = data.inputFolder;
    }
    if (data.outputFolder) {
      document.getElementById('outputFolderPath').value = data.outputFolder;
      state.outputFolder = data.outputFolder;
    }
    if (data.resourceProfile) selectResourceProfile(data.resourceProfile);
    if (data.compressPreset) {
      document.getElementById('compressPreset').value = data.compressPreset;
    }
    if (data.crf) {
      document.getElementById('crfRange').value = data.crf;
      if (document.getElementById('crfValBadge')) document.getElementById('crfValBadge').textContent = data.crf;
    }
    if (data.silenceEnabled !== undefined) {
      document.getElementById('silenceEnabled').checked = data.silenceEnabled;
      const opts = document.getElementById('silenceOptions');
      if (opts) {
        opts.style.opacity = data.silenceEnabled ? '1' : '0.4';
        opts.style.pointerEvents = data.silenceEnabled ? 'auto' : 'none';
      }
    }
    if (data.silenceThreshold) {
      document.getElementById('silenceThreshold').value = data.silenceThreshold;
      if (document.getElementById('threshVal')) document.getElementById('threshVal').textContent = data.silenceThreshold + 'dB';
    }
    if (data.minSilence) {
      document.getElementById('minSilence').value = data.minSilence;
      if (document.getElementById('minSilVal')) document.getElementById('minSilVal').textContent = data.minSilence + 's';
    }
    if (data.silencePadding) {
      document.getElementById('silencePadding').value = data.silencePadding;
      if (document.getElementById('padVal')) document.getElementById('padVal').textContent = data.silencePadding + 's';
    }
    if (data.logoPosition) document.getElementById('logoPosition').value = data.logoPosition;
    if (data.logoOpacity) {
      document.getElementById('logoOpacity').value = data.logoOpacity;
      if (document.getElementById('opacityVal')) document.getElementById('opacityVal').textContent = data.logoOpacity;
    }
    if (data.logoScale) {
      document.getElementById('logoScale').value = data.logoScale;
      if (document.getElementById('scaleVal')) document.getElementById('scaleVal').textContent = Math.round(data.logoScale*100)+'%';
    }
    if (data.logoMargin) document.getElementById('logoMargin').value = data.logoMargin;
    if (data.selectedTransition) state.selectedTransition = data.selectedTransition;
    if (data.transitionDuration) document.getElementById('transitionDuration').value = data.transitionDuration;
    if (data.slideDur) {
      document.getElementById('slideDurRange').value = data.slideDur;
      if (document.getElementById('slideDurBadge')) document.getElementById('slideDurBadge').textContent = data.slideDur + 's';
    }
    updateModeVisibility();
  } catch(e) {}
}

function attachAutoSaveListeners() {
  const selectors = [
    '#workflowModeSelect', '#inputFolderPath', '#outputFolderPath',
    '#compressPreset', '#crfRange', '#silenceEnabled', '#silenceThreshold',
    '#minSilence', '#silencePadding', '#logoPosition', '#logoOpacity',
    '#logoScale', '#logoMargin', '#transitionDuration', '#slideDurRange'
  ];
  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.addEventListener('change', saveAllSettingsToStorage);
      el.addEventListener('input', saveAllSettingsToStorage);
    }
  });
}

function resetDefaultSettings() {
  localStorage.removeItem('wv_settings');

  state.mode = 'master';
  state.resourceProfile = 'eco';
  state.selectedTransition = 'fade';

  document.getElementById('workflowModeSelect').value = 'master';
  document.getElementById('inputFolderPath').value = '';
  document.getElementById('outputFolderPath').value = '';

  selectResourceProfile('eco');

  document.getElementById('compressPreset').value = 'handbrake_fast_720p';
  document.getElementById('crfRange').value = 23;
  if (document.getElementById('crfValBadge')) document.getElementById('crfValBadge').textContent = '23';

  document.getElementById('silenceEnabled').checked = true;
  document.getElementById('silenceOptions').style.opacity = '1';
  document.getElementById('silenceOptions').style.pointerEvents = 'auto';

  document.getElementById('silenceThreshold').value = -35;
  if (document.getElementById('threshVal')) document.getElementById('threshVal').textContent = '-35dB';

  document.getElementById('minSilence').value = 0.7;
  if (document.getElementById('minSilVal')) document.getElementById('minSilVal').textContent = '0.7s';

  document.getElementById('silencePadding').value = 0.15;
  if (document.getElementById('padVal')) document.getElementById('padVal').textContent = '0.15s';

  document.getElementById('logoPosition').value = 'top_right';
  document.getElementById('logoOpacity').value = 0.85;
  if (document.getElementById('opacityVal')) document.getElementById('opacityVal').textContent = '0.85';

  document.getElementById('logoScale').value = 0.12;
  if (document.getElementById('scaleVal')) document.getElementById('scaleVal').textContent = '12%';

  document.getElementById('logoMargin').value = 20;

  document.getElementById('transitionDuration').value = 0.6;
  document.getElementById('slideDurRange').value = 3.0;
  if (document.getElementById('slideDurBadge')) document.getElementById('slideDurBadge').textContent = '3.0s';

  updateModeVisibility();
  updateProcessSummary();
  showToast(t('defaultsRestoredNotice'), 'success');
}

// ═══ WORKFLOW MODE SELECTION & DYNAMIC VISIBILITY ═══
function onWorkflowModeChange(mode) {
  state.mode = mode;
  updateModeVisibility();
  updateProcessSummary();
  saveAllSettingsToStorage();
}

function updateModeVisibility() {
  const mode = state.mode;
  const descBox = document.getElementById('modeDescriptionBox');
  
  if (descBox) {
    const descKey = 'desc' + cap(mode === 'intro_outro' ? 'introOutro' : mode);
    descBox.textContent = t(descKey) || t('descMaster');
  }

  const inputFolderCard = document.getElementById('inputFolderCard');
  const compressCard    = document.getElementById('compressCard');
  const slideshowCard   = document.getElementById('slideshowCard');
  const introCard       = document.getElementById('introCard');
  const outroCard       = document.getElementById('outroCard');
  const logoCard        = document.getElementById('logoCard');
  const settingsSilence = document.getElementById('settingsSilenceCard');

  if (compressCard) compressCard.style.display = (mode === 'compress') ? 'block' : 'none';
  if (slideshowCard) slideshowCard.style.display = (mode === 'slideshow') ? 'block' : 'none';

  if (mode === 'master') {
    if (inputFolderCard) inputFolderCard.style.display = 'block';
    if (introCard) introCard.style.display = 'block';
    if (outroCard) outroCard.style.display = 'block';
    if (logoCard) logoCard.style.display = 'block';
    if (settingsSilence) settingsSilence.style.display = 'block';
  } else if (mode === 'compress') {
    if (inputFolderCard) inputFolderCard.style.display = 'block';
    if (introCard) introCard.style.display = 'none';
    if (outroCard) outroCard.style.display = 'none';
    if (logoCard) logoCard.style.display = 'none';
    if (settingsSilence) settingsSilence.style.display = 'none';
  } else if (mode === 'silence') {
    if (inputFolderCard) inputFolderCard.style.display = 'block';
    if (introCard) introCard.style.display = 'none';
    if (outroCard) outroCard.style.display = 'none';
    if (logoCard) logoCard.style.display = 'none';
    if (settingsSilence) settingsSilence.style.display = 'block';
  } else if (mode === 'intro_outro') {
    if (inputFolderCard) inputFolderCard.style.display = 'block';
    if (introCard) introCard.style.display = 'block';
    if (outroCard) outroCard.style.display = 'block';
    if (logoCard) logoCard.style.display = 'none';
    if (settingsSilence) settingsSilence.style.display = 'none';
  } else if (mode === 'watermark') {
    if (inputFolderCard) inputFolderCard.style.display = 'block';
    if (introCard) introCard.style.display = 'none';
    if (outroCard) outroCard.style.display = 'none';
    if (logoCard) logoCard.style.display = 'block';
    if (settingsSilence) settingsSilence.style.display = 'none';
  } else if (mode === 'slideshow') {
    if (inputFolderCard) inputFolderCard.style.display = 'block';
    if (introCard) introCard.style.display = 'none';
    if (outroCard) outroCard.style.display = 'none';
    if (logoCard) logoCard.style.display = 'none';
    if (settingsSilence) settingsSilence.style.display = 'none';
  }
}

function onCompressPresetChange(preset) {
  const crfRange = document.getElementById('crfRange');
  const crfBadge = document.getElementById('crfValBadge');
  if (preset === 'handbrake_fast_720p') {
    crfRange.value = 23;
  } else if (preset === 'handbrake_very_fast_1080p') {
    crfRange.value = 24;
  } else if (preset === 'handbrake_discord') {
    crfRange.value = 28;
  }
  if (crfBadge) crfBadge.textContent = crfRange.value;
  saveAllSettingsToStorage();
}

// ═══ SYSTEM MONITOR & RESOURCE PROFILES ═══
function initSystemMonitor() {
  fetchSystemStats();
  setInterval(fetchSystemStats, 3000);
}

function fetchSystemStats() {
  fetch('/api/system/stats')
    .then(r => r.json())
    .then(stats => {
      document.getElementById('sysCpuVal').textContent = stats.cpu_percent + '%';
      document.getElementById('sysRamVal').textContent = stats.memory_percent + '%';
      document.getElementById('sysCoresVal').textContent = stats.cpu_cores || 4;

      const badge = document.getElementById('sysStatusBadge');
      const text = document.getElementById('sysStatusText');
      
      if (stats.throttling_active) {
        badge.className = 'sys-item status-badge warning';
        text.textContent = '🍃 Eco Throttling Active (CPU > 70%)';
      } else {
        badge.className = 'sys-item status-badge normal';
        text.textContent = '🟢 System Normal';
      }
    })
    .catch(() => {});
}

function selectResourceProfile(profile) {
  state.resourceProfile = profile;
  ['profileEcoCard', 'profileBalancedCard', 'profilePerfCard'].forEach(id => {
    const card = document.getElementById(id);
    if (card) card.classList.remove('active');
  });
  if (profile === 'eco') document.getElementById('profileEcoCard')?.classList.add('active');
  else if (profile === 'balanced') document.getElementById('profileBalancedCard')?.classList.add('active');
  else if (profile === 'performance') document.getElementById('profilePerfCard')?.classList.add('active');

  saveAllSettingsToStorage();
  showToast(`Resource profile set to: ${profile.toUpperCase()}`, 'info');
}

// ═══ ACTIVE BACKGROUND JOB RE-ATTACHMENT ═══
function checkActiveBackgroundJob() {
  fetch('/api/job/active')
    .then(r => r.json())
    .then(res => {
      if (res.has_active && res.job) {
        const j = res.job;
        state.jobId = j.job_id;
        showToast('🔗 Re-attached to active background job!', 'success');

        document.querySelector('[data-tab="process"]').click();

        const btn = document.getElementById('startBtn');
        btn.disabled = true;
        document.getElementById('progressSection').style.display = 'flex';
        document.getElementById('progressSection').style.flexDirection = 'column';
        document.getElementById('doneBanner').style.display = 'none';

        setGlobalStatus('running', t('processingStatus'));
        listenToJob(j.job_id, j.total || 1);
      }
    })
    .catch(() => {});
}

// ═══ TAB NAVIGATION ═══
function initTabNav() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
      if (tab === 'process') updateProcessSummary();
      if (tab === 'outputs') loadOutputsAndHistory();
    });
  });
}

// ═══ INPUT FOLDER SCAN ═══
function scanFolder() {
  const path = document.getElementById('inputFolderPath').value.trim();
  if (!path) { showToast('Please enter or browse to a folder', 'warning'); return; }
  state.inputFolder = path;
  saveAllSettingsToStorage();

  fetch(`/api/scan-folder?path=${encodeURIComponent(path)}`)
    .then(r => r.json())
    .then(data => {
      state.videos = data.videos || [];
      state.images = data.images || [];
      state.audios = data.audios || [];

      if (state.mode === 'slideshow') {
        state.selectedVideos = state.images.map(img => img.path);
      } else {
        state.selectedVideos = state.videos.map(v => v.path);
      }

      renderVideoList();
      const card = document.getElementById('videoListCard');
      const totalCount = state.mode === 'slideshow' ? state.images.length : state.videos.length;
      card.style.display = totalCount ? 'block' : 'none';

      if (!totalCount) showToast(t('noVideosFound'), 'warning');
      else showToast(`${totalCount} ${t('videosFound')}`, 'success');
      updateProcessSummary();
    })
    .catch(e => showToast('Scan failed: ' + e, 'error'));
}

function renderVideoList() {
  const list = document.getElementById('videoList');
  const countLabel = document.getElementById('videoCountLabel');
  
  const itemsToDisplay = state.mode === 'slideshow' ? state.images : state.videos;
  countLabel.textContent = `${itemsToDisplay.length} ${t('videosFound')}`;
  list.innerHTML = '';

  itemsToDisplay.forEach(v => {
    const isSelected = state.selectedVideos.includes(v.path);
    const div = document.createElement('div');
    div.className = `video-item${isSelected ? ' selected' : ''}`;
    const icon = state.mode === 'slideshow' ? '🖼️' : '🎥';
    div.innerHTML = `
      <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleVideo('${v.path}', this.checked)">
      <span class="video-item-icon">${icon}</span>
      <div class="video-item-info">
        <div class="video-item-name" title="${v.name}">${v.name}</div>
        <div class="video-item-meta">${v.size_mb} MB · ${v.ext.toUpperCase()}</div>
      </div>
      <button class="btn-preview-small" onclick="previewVideo('${v.path}', '${v.name}')" title="${t('previewVideo')}">▶</button>
    `;
    list.appendChild(div);
  });
}

function toggleVideo(path, checked) {
  if (checked && !state.selectedVideos.includes(path)) state.selectedVideos.push(path);
  if (!checked) state.selectedVideos = state.selectedVideos.filter(p => p !== path);
  document.querySelectorAll('.video-item').forEach(item => {
    const cb = item.querySelector('input[type=checkbox]');
    item.classList.toggle('selected', cb && cb.checked);
  });
  updateProcessSummary();
}

function selectAllVideos(val) {
  const itemsToDisplay = state.mode === 'slideshow' ? state.images : state.videos;
  state.selectedVideos = val ? itemsToDisplay.map(v => v.path) : [];
  renderVideoList();
  updateProcessSummary();
}

// ═══ CLEAR FILES ═══
function clearFile(type) {
  state[type] = '';
  const display = document.getElementById(`${type}Display`);
  const preview = document.getElementById(`${type}Preview`);
  if (display) { display.textContent = t('noFileSelected'); display.classList.remove('has-file'); }
  if (preview) { preview.style.display = 'none'; preview.src = ''; }
  if (type === 'logo') document.getElementById('logoSettings').style.display = 'none';
  updateProcessSummary();
}

// ═══ FILE BROWSER MODAL ═══
function openBrowser(context) {
  browserContext = context;
  browserSelectedItem = null;
  document.getElementById('browserSelectedLabel').textContent = '';

  let startPath = '';
  if (context === 'inputFolder' && state.inputFolder)  startPath = state.inputFolder;
  else if (context === 'outputFolder' && state.outputFolder) startPath = state.outputFolder;
  else if (context === 'intro' && state.intro) startPath = state.intro;
  else if (context === 'outro' && state.outro) startPath = state.outro;
  else if (context === 'logo' && state.logo) startPath = state.logo;
  else if (context === 'slideshowAudio' && state.slideshowAudio) startPath = state.slideshowAudio;

  document.getElementById('browserSelectBtn').disabled = (context === 'inputFolder' || context === 'outputFolder') ? false : true;
  document.getElementById('browserModal').classList.add('open');
  browserNav(startPath || '/');
}

function browserNav(path) {
  if (!path) path = '/';
  fetch(`/api/browse?path=${encodeURIComponent(path)}`)
    .then(r => r.json())
    .then(data => {
      browserCurrentPath = data.current;
      browserParent = data.parent;
      document.getElementById('browserCurrentPath').textContent = data.current;
      document.getElementById('browserBackBtn').disabled = !data.parent;
      renderBrowserList(data.items);
    });
}

function renderBrowserList(items) {
  const list = document.getElementById('browserList');
  list.innerHTML = '';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = `browser-item ${item.is_dir ? 'dir' : item.is_video ? 'video-file' : item.is_audio ? 'audio-file' : 'image-file'}`;

    let icon = '📁';
    if (!item.is_dir) {
      if (item.is_video) icon = '🎥';
      else if (item.is_audio) icon = '🎵';
      else if (item.is_image) icon = '🖼️';
      else icon = '📄';
    }

    const size = item.is_dir ? '' : formatSize(item.size);
    div.innerHTML = `<span class="browser-item-icon">${icon}</span>
      <span class="browser-item-name">${item.name}</span>
      <span class="browser-item-size">${size}</span>`;

    div.addEventListener('click', () => {
      if (item.is_dir) {
        if (browserContext === 'inputFolder' || browserContext === 'outputFolder') {
          document.querySelectorAll('.browser-item').forEach(el => el.classList.remove('selected'));
          div.classList.add('selected');
          browserSelectedItem = item;
          document.getElementById('browserSelectedLabel').textContent = item.path;
          document.getElementById('browserSelectBtn').disabled = false;
        }
      } else {
        document.querySelectorAll('.browser-item').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        browserSelectedItem = item;
        document.getElementById('browserSelectedLabel').textContent = item.name;
        document.getElementById('browserSelectBtn').disabled = false;
      }
    });

    div.addEventListener('dblclick', () => {
      if (item.is_dir) browserNav(item.path);
    });

    list.appendChild(div);
  });
}

function confirmBrowserSelection() {
  if (!browserSelectedItem && (browserContext === 'inputFolder' || browserContext === 'outputFolder')) {
    browserSelectedItem = { path: browserCurrentPath, name: browserCurrentPath, is_dir: true };
  }
  if (!browserSelectedItem) return;

  const path = browserSelectedItem.path;

  if (browserContext === 'inputFolder') {
    state.inputFolder = path;
    document.getElementById('inputFolderPath').value = path;
    closeBrowserModal();
    scanFolder();
  } else if (browserContext === 'outputFolder') {
    state.outputFolder = path;
    document.getElementById('outputFolderPath').value = path;
    closeBrowserModal();
  } else if (['intro','outro'].includes(browserContext)) {
    state[browserContext] = path;
    const display = document.getElementById(`${browserContext}Display`);
    display.textContent = browserSelectedItem.name;
    display.classList.add('has-file');
    const preview = document.getElementById(`${browserContext}Preview`);
    preview.src = `/api/video/stream?path=${encodeURIComponent(path)}`;
    preview.style.display = 'block';
    closeBrowserModal();
    updateProcessSummary();
  } else if (browserContext === 'logo') {
    state.logo = path;
    const display = document.getElementById('logoDisplay');
    display.textContent = browserSelectedItem.name;
    display.classList.add('has-file');
    document.getElementById('logoSettings').style.display = 'block';
    closeBrowserModal();
    updateProcessSummary();
  } else if (browserContext === 'slideshowAudio') {
    state.slideshowAudio = path;
    const display = document.getElementById('slideshowAudioDisplay');
    display.textContent = browserSelectedItem.name;
    display.classList.add('has-file');
    closeBrowserModal();
    updateProcessSummary();
  }
  saveAllSettingsToStorage();
}

function closeBrowserModal() { document.getElementById('browserModal').classList.remove('open'); }
function closeBrowser(e)     { if (e.target.id === 'browserModal') closeBrowserModal(); }

// ═══ VIDEO / MEDIA PREVIEW MODAL ═══
function previewVideo(path, name) {
  const modal = document.getElementById('videoModal');
  const video = document.getElementById('modalVideo');
  const infoBar = document.getElementById('videoInfoBar');
  document.getElementById('videoModalTitle').textContent = name || t('previewTitle');
  video.src = `/api/video/stream?path=${encodeURIComponent(path)}`;
  video.load(); video.play().catch(()=>{});
  infoBar.innerHTML = '<span>Loading info...</span>';
  modal.classList.add('open');

  fetch(`/api/video-info?path=${encodeURIComponent(path)}`)
    .then(r => r.json())
    .then(info => {
      infoBar.innerHTML = `
        <span>⏱ <strong>${formatDur(info.duration)}</strong></span>
        <span>📐 <strong>${info.width||'—'}×${info.height||'—'}</strong></span>
        <span>🎞 <strong>${info.fps||'—'} fps</strong></span>
        <span>💾 <strong>${info.size_mb} MB</strong></span>`;
    }).catch(() => { infoBar.innerHTML = ''; });
}

function closeVideoModal(e) {
  if (!e || e.target.id === 'videoModal') {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('open');
    document.getElementById('modalVideo').pause();
    document.getElementById('modalVideo').src = '';
  }
}

// ═══ TRANSITIONS ═══
let allTransitions = [];
let currentCatFilter = 'all';
let previewingTransId = null;

function initTransitions() {
  fetch('/api/transitions')
    .then(r => r.json())
    .then(data => {
      allTransitions = data;
      buildCatFilters();
      renderTransitionGrid();
    });
}

function buildCatFilters() {
  const cats = ['all', ...new Set(allTransitions.map(t => t.cat))];
  const container = document.getElementById('catFilters');
  container.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-btn${cat === 'all' ? ' active' : ''}`;
    btn.textContent = t(`cat${cap(cat)}`);
    btn.dataset.cat = cat;
    btn.onclick = () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCatFilter = cat;
      renderTransitionGrid();
    };
    container.appendChild(btn);
  });
}

function renderTransitionGrid() {
  const grid = document.getElementById('transitionGrid');
  grid.innerHTML = '';
  const filtered = currentCatFilter === 'all'
    ? allTransitions : allTransitions.filter(t => t.cat === currentCatFilter);

  filtered.forEach(tr => {
    const card = document.createElement('div');
    card.className = `trans-card${tr.id === state.selectedTransition ? ' selected' : ''}`;
    card.dataset.id = tr.id;

    card.innerHTML = `
      <div class="trans-thumb" id="thumb-${tr.id}">
        <span class="trans-thumb-icon">${tr.icon}</span>
      </div>
      <div class="trans-card-name">${tr[currentLang] || tr.en}</div>
      <div class="trans-card-cat">${t('cat' + cap(tr.cat))}</div>`;

    card.addEventListener('click', () => openTransPreview(tr));
    grid.appendChild(card);
  });
}

function openTransPreview(tr) {
  previewingTransId = tr.id;
  document.getElementById('transModalTitle').textContent = tr[currentLang] || tr.en;
  const video = document.getElementById('transModalVideo');
  video.src = '';
  document.getElementById('transModal').classList.add('open');

  const td = parseFloat(document.getElementById('transitionDuration').value) || 0.6;

  fetch(`/api/preview/transition`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({transition: tr.id, duration: td})
  })
  .then(r => r.json())
  .then(data => {
    if (data.url) {
      video.src = data.url + '?t=' + Date.now();
      video.load(); video.play().catch(()=>{});
      const thumb = document.getElementById(`thumb-${tr.id}`);
      if (thumb) {
        const v = document.createElement('video');
        v.src = data.url; v.autoplay = true; v.loop = true; v.muted = true;
        v.style.width = '100%'; v.style.height = '100%'; v.style.objectFit = 'cover';
        thumb.innerHTML = ''; thumb.appendChild(v);
      }
    }
  });
}

function closeTransModal(e) {
  if (!e || e.target.id === 'transModal') {
    document.getElementById('transModal').classList.remove('open');
    document.getElementById('transModalVideo').pause();
  }
}

function selectTransitionFromModal() {
  if (!previewingTransId) return;
  state.selectedTransition = previewingTransId;
  const tr = allTransitions.find(t => t.id === previewingTransId);
  document.getElementById('selectedTransName').textContent = tr ? (tr[currentLang] || tr.en) : previewingTransId;

  document.querySelectorAll('.trans-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === previewingTransId);
  });
  saveAllSettingsToStorage();
  closeTransModal();
}

function previewAllTransitions() {
  showToast(t('generating'), 'info');
  fetch('/api/preview/all-transitions', {method:'POST'})
    .then(r => r.json())
    .then(() => {
      setTimeout(() => loadAllThumbnails(), 3000);
    });
}

function loadAllThumbnails() {
  allTransitions.forEach(tr => {
    const thumb = document.getElementById(`thumb-${tr.id}`);
    if (!thumb || thumb.querySelector('video')) return;
    fetch(`/api/preview/transition`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({transition: tr.id, duration: 0.7})
    }).then(r=>r.json()).then(data => {
      if (data.url && thumb) {
        const v = document.createElement('video');
        v.src = data.url; v.autoplay = true; v.loop = true; v.muted = true;
        v.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:6px';
        thumb.innerHTML = ''; thumb.appendChild(v);
      }
    }).catch(()=>{});
  });
}

// ═══ SETTINGS ═══
function initSilenceToggle() {
  document.getElementById('silenceEnabled').addEventListener('change', function() {
    document.getElementById('silenceOptions').style.opacity = this.checked ? '1' : '0.4';
    document.getElementById('silenceOptions').style.pointerEvents = this.checked ? 'auto' : 'none';
    saveAllSettingsToStorage();
  });
}

// ═══ PROCESS SUMMARY ═══
function updateProcessSummary() {
  const summary = document.getElementById('processSummary');
  const items = [
    { val: state.mode.toUpperCase(), lbl: 'Mode' },
    { val: state.selectedVideos.length, lbl: 'Items' },
    { val: state.intro ? '✅' : '—', lbl: 'Intro' },
    { val: state.outro ? '✅' : '—', lbl: 'Outro' },
    { val: state.logo  ? '✅' : '—', lbl: 'Logo' },
    { val: state.resourceProfile.toUpperCase(), lbl: 'Profile' },
  ];
  summary.innerHTML = items.map(i => `
    <div class="summary-item">
      <div class="val">${i.val}</div>
      <div class="lbl">${i.lbl}</div>
    </div>`).join('');
}

// ═══ OUTPUTS & HISTORY GALLERY ═══
function loadOutputsAndHistory() {
  const gallery = document.getElementById('outputsGallery');
  const emptyMsg = document.getElementById('noOutputsMsg');
  gallery.innerHTML = '<div class="loading-spinner">Loading outputs...</div>';

  fetch('/api/outputs')
    .then(r => r.json())
    .then(data => {
      gallery.innerHTML = '';
      if (!data.files || !data.files.length) {
        emptyMsg.style.display = 'block';
        return;
      }
      emptyMsg.style.display = 'none';

      data.files.forEach(f => {
        const card = document.createElement('div');
        card.className = 'output-card';
        card.innerHTML = `
          <div class="output-thumb">
            <video src="${f.url}" preload="metadata" controls></video>
          </div>
          <div class="output-body">
            <div class="output-title" title="${f.name}">${f.name}</div>
            <div class="output-meta">💾 ${f.size_mb} MB · 🕒 ${f.mtime}</div>
            <div class="output-actions">
              <a href="${f.url}" download="${f.name}" class="btn-primary tiny">${t('downloadBtn')}</a>
              <button onclick="deleteOutputFile('${f.path}')" class="btn-ghost tiny danger">${t('deleteBtn')}</button>
            </div>
          </div>
        `;
        gallery.appendChild(card);
      });
    })
    .catch(() => {
      gallery.innerHTML = '<div class="error-msg">Failed to load outputs</div>';
    });
}

function deleteOutputFile(path) {
  if (!confirm('Are you sure you want to delete this output video?')) return;
  fetch('/api/output/delete', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({path: path})
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      showToast('Video deleted', 'info');
      loadOutputsAndHistory();
    } else {
      showToast('Failed to delete: ' + (res.error || ''), 'error');
    }
  });
}

// ═══ PROCESSING ═══
function startProcessing() {
  if (!state.selectedVideos.length && state.mode !== 'slideshow') {
    showToast('No media items selected!', 'warning');
    document.querySelector('[data-tab="input"]').click();
    return;
  }

  const cfg = {
    mode: state.mode,
    videos: state.selectedVideos,
    images: state.selectedVideos,
    audio_track: state.slideshowAudio,
    slide_duration: parseFloat(document.getElementById('slideDurRange')?.value || 3.0),
    compress_preset: document.getElementById('compressPreset')?.value,
    crf: parseInt(document.getElementById('crfRange')?.value || 23),
    output_folder: document.getElementById('outputFolderPath').value.trim() || null,
    intro:  state.intro,
    outro:  state.outro,
    logo:   state.logo,
    logo_position: document.getElementById('logoPosition').value,
    logo_opacity:  parseFloat(document.getElementById('logoOpacity').value),
    logo_scale:    parseFloat(document.getElementById('logoScale').value),
    logo_margin:   parseInt(document.getElementById('logoMargin').value),
    transition: state.selectedTransition,
    transition_duration: parseFloat(document.getElementById('transitionDuration').value),
    remove_silence: document.getElementById('silenceEnabled').checked,
    silence_threshold: parseFloat(document.getElementById('silenceThreshold').value),
    min_silence: parseFloat(document.getElementById('minSilence').value),
    silence_padding: parseFloat(document.getElementById('silencePadding').value),
    resource_profile: state.resourceProfile
  };

  const btn = document.getElementById('startBtn');
  btn.disabled = true;
  document.getElementById('progressSection').style.display = 'flex';
  document.getElementById('progressSection').style.flexDirection = 'column';
  document.getElementById('doneBanner').style.display = 'none';
  document.getElementById('processLog').innerHTML = '';
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('progressCounter').textContent = `0 / ${state.selectedVideos.length || 1}`;
  setGlobalStatus('running', t('processingStatus'));

  fetch('/api/process', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(cfg)
  })
  .then(r => r.json())
  .then(data => {
    state.jobId = data.job_id;
    listenToJob(data.job_id, state.selectedVideos.length || 1);
  })
  .catch(e => { showToast('Failed to start: ' + e, 'error'); btn.disabled = false; });
}

function listenToJob(jobId, total) {
  if (state.jobStream) state.jobStream.close();
  const es = new EventSource(`/api/job/${jobId}/stream`);
  state.jobStream = es;

  es.onmessage = (e) => {
    const data = JSON.parse(e.data);

    const pct = total > 0 ? Math.round((data.progress / total) * 100) : 0;
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressCounter').textContent = `${data.progress} / ${total}`;

    if (data.current_file)
      document.getElementById('currentFileLabel').textContent = `📹 ${data.current_file}`;

    document.getElementById('elapsedLabel').textContent = data.elapsed ? `⏱ ${data.elapsed}s` : '';

    if (data.system_stats) {
      document.getElementById('sysCpuVal').textContent = data.system_stats.cpu_percent + '%';
      document.getElementById('sysRamVal').textContent = data.system_stats.memory_percent + '%';
    }

    if (data.new_logs && data.new_logs.length) {
      const logEl = document.getElementById('processLog');
      data.new_logs.forEach(log => {
        const line = document.createElement('div');
        line.className = `log-line ${log.level || 'info'}`;
        line.innerHTML = `<span class="log-ts">${log.ts}</span><span class="log-msg">${escHtml(log.msg)}</span>`;
        logEl.appendChild(line);
      });
      logEl.scrollTop = logEl.scrollHeight;
    }

    if (data.status === 'done') {
      document.getElementById('progressBar').style.width = '100%';
      document.getElementById('progressCounter').textContent = `${total} / ${total}`;
      document.getElementById('doneBanner').style.display = 'flex';
      document.getElementById('doneSummary').textContent = `${total} item(s) processed in ${data.elapsed}s → ${data.output}`;
      setGlobalStatus('done', t('doneStatus'));
      document.getElementById('progressLabel').textContent = t('doneStatus');
      document.getElementById('startBtn').disabled = false;
      es.close();
    } else if (data.status === 'error') {
      setGlobalStatus('error', t('errorStatus'));
      document.getElementById('progressLabel').textContent = t('errorStatus');
      document.getElementById('startBtn').disabled = false;
      es.close();
    }
  };
  es.onerror = () => { es.close(); setGlobalStatus('idle', t('idle')); document.getElementById('startBtn').disabled = false; };
}

function openOutputFolder() {
  document.querySelector('[data-tab="outputs"]').click();
}

// ═══ GLOBAL STATUS ═══
function setGlobalStatus(state, text) {
  const pill = document.getElementById('globalStatus');
  pill.className = `status-pill ${state}`;
  pill.querySelector('span:last-child').textContent = text;
}

// ═══ HELPERS ═══
function formatDur(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(1) + ' MB';
}

function cap(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function showToast(msg, type='info') {
  const toast = document.createElement('div');
  const colors = {info:'#00b4d8',success:'#3fb950',warning:'#f0883e',error:'#f85149'};
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:#161b22;border:1px solid ${colors[type]||colors.info};
    color:#e6edf3;padding:12px 18px;border-radius:10px;
    font-size:13px;font-family:var(--font,sans-serif);
    box-shadow:0 4px 20px rgba(0,0,0,0.4);
    animation:slideUp 0.25s ease;max-width:350px;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; setTimeout(()=>toast.remove(),300); }, 3500);
}

const style = document.createElement('style');
style.textContent = '@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}';
document.head.appendChild(style);

// ═══ AI PARSING & KEY MANAGEMENT ═══
function switchToTab(tabName) {
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.click();
}

function applyUsageCommand(cmdKey) {
  const prompts = {
    cut_silence_compress: "Cut out silence gaps below -35dB, compress video for 720p HD with CRF 23, and apply smooth fade transition",
    watermark_bounce: "Overlay watermark logo dynamically bouncing across all 4 screen corners at 80% opacity",
    intro_outro_fade: "Weld intro and outro clips onto videos with fade transition and eco resource profile",
    slideshow_3s: "Create a photo slideshow album with 3 seconds per image synced with background audio"
  };
  const text = prompts[cmdKey] || "";
  const mainInput = document.getElementById('aiMainPromptInput');
  const tabInput  = document.getElementById('aiTabPromptInput');
  if (mainInput) mainInput.value = text;
  if (tabInput)  tabInput.value = text;
  
  parseAiPrompt(mainInput ? 'main' : 'tab');
}

function saveAiKeysConfig() {
  const provider = document.getElementById('aiProviderSelect')?.value || 'openrouter';
  const keys     = document.getElementById('aiMultiKeysInput')?.value || '';
  const model    = document.getElementById('aiModelInput')?.value || '';

  const config = { provider, keys, model };
  localStorage.setItem('wv_ai_config', JSON.stringify(config));
  
  const statusEl = document.getElementById('aiKeysStatus');
  if (statusEl) {
    statusEl.textContent = t('aiKeysSavedNotice');
    statusEl.style.color = 'var(--success)';
  }
  renderSavedKeysList();
  showToast(t('aiKeysSavedNotice'), 'success');
}

function loadAiKeysConfig() {
  const raw = localStorage.getItem('wv_ai_config');
  renderSavedKeysList();
  if (!raw) return;
  try {
    const config = JSON.parse(raw);
    if (config.provider && document.getElementById('aiProviderSelect')) {
      document.getElementById('aiProviderSelect').value = config.provider;
    }
    if (config.keys && document.getElementById('aiMultiKeysInput')) {
      document.getElementById('aiMultiKeysInput').value = config.keys;
    }
    if (config.model && document.getElementById('aiModelInput')) {
      document.getElementById('aiModelInput').value = config.model;
    }
    renderSavedKeysList();
  } catch(e) {}
}

function onAiProviderChange(provider) {
  const modelInput = document.getElementById('aiModelInput');
  if (!modelInput) return;
  if (provider === 'openrouter') {
    modelInput.placeholder = 'e.g., meta-llama/llama-3.3-70b-instruct:free';
  } else if (provider === 'gemini') {
    modelInput.placeholder = 'e.g., gemini-1.5-flash';
  } else if (provider === 'groq') {
    modelInput.placeholder = 'e.g., llama-3.3-70b-versatile';
  } else if (provider === 'openai') {
    modelInput.placeholder = 'e.g., gpt-4o-mini';
  }
  saveAiKeysConfig();
}

function parseAiPrompt(source = 'main') {
  const inputEl = source === 'main' ? document.getElementById('aiMainPromptInput') : document.getElementById('aiTabPromptInput');
  const statusEl = source === 'main' ? document.getElementById('aiMainStatus') : document.getElementById('aiTabStatus');
  const prompt = inputEl ? inputEl.value.trim() : '';

  if (!prompt) {
    showToast('Please enter a natural language editing prompt', 'warning');
    return;
  }

  const rawConfig = localStorage.getItem('wv_ai_config');
  let provider = 'openrouter', keys = '', model = '';
  if (rawConfig) {
    try {
      const parsed = JSON.parse(rawConfig);
      provider = parsed.provider || 'openrouter';
      keys = parsed.keys || '';
      model = parsed.model || '';
    } catch(e) {}
  }

  if (!keys && document.getElementById('aiMultiKeysInput')) {
    keys = document.getElementById('aiMultiKeysInput').value;
  }

  if (!keys.trim()) {
    showToast('No API keys configured! Switching to Key Management...', 'warning');
    switchToTab('keys');
    return;
  }

  if (statusEl) {
    statusEl.textContent = t('aiParsingStatus');
    statusEl.style.color = 'var(--accent)';
  }

  fetch('/api/ai/parse-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt,
      provider: provider,
      api_keys: keys,
      model: model
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.error) {
      if (statusEl) {
        statusEl.textContent = '❌ Error: ' + res.error;
        statusEl.style.color = 'var(--danger)';
      }
      showToast('AI Error: ' + res.error, 'error');
      return;
    }

    if (res.mode) {
      document.getElementById('workflowModeSelect').value = res.mode;
      onWorkflowModeChange(res.mode);
    }
    if (res.remove_silence !== undefined) {
      document.getElementById('silenceEnabled').checked = res.remove_silence;
    }
    if (res.silence_threshold !== undefined) {
      document.getElementById('silenceThreshold').value = res.silence_threshold;
      if (document.getElementById('threshVal')) document.getElementById('threshVal').textContent = res.silence_threshold + 'dB';
    }
    if (res.min_silence !== undefined) {
      document.getElementById('minSilence').value = res.min_silence;
      if (document.getElementById('minSilVal')) document.getElementById('minSilVal').textContent = res.min_silence + 's';
    }
    if (res.silence_padding !== undefined) {
      document.getElementById('silencePadding').value = res.silence_padding;
      if (document.getElementById('padVal')) document.getElementById('padVal').textContent = res.silence_padding + 's';
    }
    if (res.compress_preset) {
      document.getElementById('compressPreset').value = res.compress_preset;
    }
    if (res.crf !== undefined) {
      document.getElementById('crfRange').value = res.crf;
      if (document.getElementById('crfValBadge')) document.getElementById('crfValBadge').textContent = res.crf;
    }
    if (res.logo_position) {
      document.getElementById('logoPosition').value = res.logo_position;
    }
    if (res.logo_opacity !== undefined) {
      document.getElementById('logoOpacity').value = res.logo_opacity;
      if (document.getElementById('opacityVal')) document.getElementById('opacityVal').textContent = res.logo_opacity;
    }
    if (res.logo_scale !== undefined) {
      document.getElementById('logoScale').value = res.logo_scale;
      if (document.getElementById('scaleVal')) document.getElementById('scaleVal').textContent = Math.round(res.logo_scale * 100) + '%';
    }
    if (res.logo_margin !== undefined) {
      document.getElementById('logoMargin').value = res.logo_margin;
    }
    if (res.transition) {
      state.selectedTransition = res.transition;
    }
    if (res.transition_duration !== undefined) {
      document.getElementById('transitionDuration').value = res.transition_duration;
    }
    if (res.resource_profile) {
      selectResourceProfile(res.resource_profile);
    }

    saveAllSettingsToStorage();

    const explanation = res.explanation || 'Studio settings auto-configured!';
    if (statusEl) {
      statusEl.textContent = '✨ ' + explanation;
      statusEl.style.color = 'var(--success)';
    }

    const resCard = document.getElementById('aiResultCard');
    const resBody = document.getElementById('aiResultBody');
    if (resCard && resBody) {
      resCard.style.display = 'block';
      resBody.innerHTML = `
        <div class="ai-res-item"><strong>Mode:</strong> ${res.mode || 'master'}</div>
        <div class="ai-res-item"><strong>Silence Trim:</strong> ${res.remove_silence ? 'Enabled ('+res.silence_threshold+'dB)' : 'Disabled'}</div>
        <div class="ai-res-item"><strong>Compression:</strong> ${res.compress_preset || 'Standard'} (CRF ${res.crf || 23})</div>
        <div class="ai-res-item"><strong>Watermark:</strong> Position: ${res.logo_position || 'top_right'}, Opacity: ${res.logo_opacity || 0.85}</div>
        <div class="ai-res-item"><strong>Transition:</strong> ${res.transition || 'fade'} (${res.transition_duration || 0.6}s)</div>
        <div class="ai-res-item"><strong>Provider Used:</strong> Key #${res.used_key_index || 1} via ${res.used_provider || provider}</div>
        <div class="ai-res-explanation">💡 <em>${explanation}</em></div>
      `;
    }

    showToast('✨ ' + explanation, 'success');
  })
  .catch(err => {
    if (statusEl) {
      statusEl.textContent = '❌ Failed to reach AI provider';
      statusEl.style.color = 'var(--danger)';
    }
    showToast('Failed to call AI server: ' + err, 'error');
  });
}

function renderSavedKeysList() {
  const container = document.getElementById('savedKeysListContainer');
  if (!container) return;

  const raw = localStorage.getItem('wv_ai_config');
  if (!raw) {
    container.innerHTML = `<div class="empty-state">${t('noSavedKeysNotice')}</div>`;
    return;
  }

  try {
    const config = JSON.parse(raw);
    const provider = config.provider || 'openrouter';
    const keysRaw = config.keys || '';
    const keys = keysRaw.split('\n').map(k => k.trim()).filter(k => k);

    if (!keys.length) {
      container.innerHTML = `<div class="empty-state">${t('noSavedKeysNotice')}</div>`;
      return;
    }

    const providerIcons = {
      openrouter: '🌐 OpenRouter',
      gemini: '🟢 Google Gemini',
      groq: '⚡ Groq',
      openai: '🤖 OpenAI'
    };

    container.innerHTML = '';
    keys.forEach((key, idx) => {
      const maskedKey = key.length > 12 ? (key.slice(0, 7) + '...' + key.slice(-4)) : key;
      const card = document.createElement('div');
      card.className = 'saved-key-card';
      card.innerHTML = `
        <div class="key-card-left">
          <span class="key-index-badge">Key #${idx + 1}</span>
          <span class="key-provider-badge">${providerIcons[provider] || provider}</span>
          <code class="key-masked-str" title="${key}">${maskedKey}</code>
        </div>
        <div class="key-card-actions">
          <button class="btn-ghost tiny" onclick="copySingleKey('${key}')">📋 ${t('copyKeyBtn')}</button>
          <button class="btn-ghost tiny danger" onclick="deleteSingleKey(${idx})">🗑️ ${t('deleteKeyBtn')}</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch(e) {
    container.innerHTML = `<div class="empty-state">${t('noSavedKeysNotice')}</div>`;
  }
}

function copySingleKey(keyStr) {
  navigator.clipboard.writeText(keyStr).then(() => {
    showToast('Key copied to clipboard! 📋', 'success');
  }).catch(() => {
    showToast('Key: ' + keyStr, 'info');
  });
}

function deleteSingleKey(indexToDelete) {
  const raw = localStorage.getItem('wv_ai_config');
  if (!raw) return;
  try {
    const config = JSON.parse(raw);
    const keys = (config.keys || '').split('\n').map(k => k.trim()).filter(k => k);
    if (indexToDelete >= 0 && indexToDelete < keys.length) {
      keys.splice(indexToDelete, 1);
      config.keys = keys.join('\n');
      localStorage.setItem('wv_ai_config', JSON.stringify(config));
      if (document.getElementById('aiMultiKeysInput')) {
        document.getElementById('aiMultiKeysInput').value = config.keys;
      }
      renderSavedKeysList();
      showToast('Key removed from pool 🗑️', 'info');
    }
  } catch(e) {}
}

function clearAllStoredKeys() {
  if (!confirm('Are you sure you want to clear all stored API keys?')) return;
  localStorage.removeItem('wv_ai_config');
  if (document.getElementById('aiMultiKeysInput')) document.getElementById('aiMultiKeysInput').value = '';
  if (document.getElementById('aiModelInput')) document.getElementById('aiModelInput').value = '';
  renderSavedKeysList();
  showToast('All stored keys cleared', 'info');
}

function onSelectSuggestedPrompt(val, source = 'main') {
  const promptMap = {
    full_auto: "Full auto edit pipeline: detect and remove dead silence gaps below -35dB, weld intro and outro clips with fade transition, overlay bouncing logo watermark at 80% opacity, and compress video for 720p HD with CRF 23.",
    silence_trim: "Cut out dead silence gaps longer than 0.7s with audio noise threshold -35dB and keep 0.15s padding around speech cuts.",
    compress_whatsapp: "Compress video for WhatsApp and Discord sharing using fast 720p HD preset with CRF 23 without losing video clarity.",
    watermark_bounce: "Overlay watermark logo image dynamically bouncing between all four screen corners at 80% opacity.",
    intro_outro_weld: "Weld intro clip and outro clip onto the video batch with 0.8s smooth fade transition.",
    slideshow_album: "Turn a folder of photos into a continuous 1080p slideshow video album with 3 seconds per photo synced with background audio."
  };

  const text = promptMap[val] || '';
  if (!text) return;

  const mainInput = document.getElementById('aiMainPromptInput');
  const tabInput  = document.getElementById('aiTabPromptInput');
  if (mainInput) mainInput.value = text;
  if (tabInput)  tabInput.value = text;

  const mainSelect = document.getElementById('aiMainPromptDropdown');
  const tabSelect  = document.getElementById('aiTabPromptDropdown');
  if (mainSelect) mainSelect.value = val;
  if (tabSelect)  tabSelect.value = val;

  showToast('Suggested prompt template loaded! ✨ Click Auto-Configure to apply.', 'info');
}
