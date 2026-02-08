const apiBase = window.location.origin;
const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
let socket = null;

const els = {
  hospitalId: document.getElementById('hospitalId'),
  live: {
    available: document.getElementById('liveAvailable'),
    occupied: document.getElementById('liveOccupied'),
    waiting: document.getElementById('liveWaiting'),
    inProgress: document.getElementById('liveInProgress'),
    wait: document.getElementById('livePredictedWait'),
    stamp: document.getElementById('liveStamp'),
  },
  forms: {
    queue: document.getElementById('queueForm'),
    start: document.getElementById('startForm'),
    complete: document.getElementById('completeForm'),
    bed: document.getElementById('bedForm'),
  },
  log: document.getElementById('log'),
  connectBtn: document.getElementById('connectBtn'),
  statusDot: document.getElementById('statusDot'),
};

function log(text) {
  const time = new Date().toLocaleTimeString();
  els.log.textContent += `[${time}] ${text}\n`;
  els.log.scrollTop = els.log.scrollHeight;
}

function setDot(status) {
  const colors = { connected: '#1fd5e5', connecting: '#ffba36', closed: '#ff6b6b' };
  els.statusDot.style.background = colors[status] || '#9bb0cc';
}

function updateLive(data) {
  els.live.available.textContent = data.available_beds ?? '—';
  els.live.occupied.textContent = data.occupied_beds ?? '—';
  els.live.waiting.textContent = data.waiting_patients ?? '—';
  els.live.inProgress.textContent = data.in_progress ?? '—';
  els.live.wait.textContent = data.predicted_wait_minutes ?? '—';
  els.live.stamp.textContent = data.last_updated
    ? new Date(data.last_updated).toLocaleTimeString()
    : '—';
}

function connectSocket() {
  const hospitalId = els.hospitalId.value.trim();
  if (!hospitalId) return alert('Enter hospital id');
  if (socket) socket.close();
  setDot('connecting');
  const url = `${wsScheme}://${window.location.host}/ws/hospitals/${hospitalId}/`;
  socket = new WebSocket(url);

  socket.onopen = () => {
    setDot('connected');
    log(`WebSocket connected to hospital ${hospitalId}`);
  };
  socket.onclose = () => {
    setDot('closed');
    log('WebSocket closed');
  };
  socket.onerror = (err) => log(`WebSocket error: ${err.message || err}`);
  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === 'status') {
        updateLive(payload);
      }
      log(`WS: ${event.data}`);
    } catch (e) {
      log(`Failed to parse message: ${event.data}`);
    }
  };
}

async function fetchLive() {
  const hospitalId = els.hospitalId.value.trim();
  if (!hospitalId) return alert('Enter hospital id');
  try {
    const res = await fetch(`${apiBase}/api/status/${hospitalId}/`);
    const data = await res.json();
    updateLive(data);
    log('Polled live status');
  } catch (e) {
    log(`Failed to fetch: ${e}`);
  }
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status}: ${txt}`);
  }
  return res.json();
}

els.forms.queue.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    hospital: Number(els.hospitalId.value),
    department: e.target.department.value ? Number(e.target.department.value) : null,
    patient_name: e.target.patient.value,
    symptoms: e.target.symptoms.value,
  };
  try {
    const data = await postJSON(`${apiBase}/api/queue/`, body);
    log(`Created queue entry #${data.id}`);
    fetchLive();
  } catch (err) {
    alert(err.message);
    log(`Error creating queue entry: ${err}`);
  }
});

els.forms.start.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = e.target.queueId.value;
  try {
    const data = await postJSON(`${apiBase}/api/queue/${id}/start/`, {});
    log(`Started entry #${data.id}`);
    fetchLive();
  } catch (err) {
    alert(err.message);
    log(`Error starting entry: ${err}`);
  }
});

els.forms.complete.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = e.target.queueIdComplete.value;
  try {
    const data = await postJSON(`${apiBase}/api/queue/${id}/complete/`, {});
    log(`Completed entry #${data.id}`);
    fetchLive();
  } catch (err) {
    alert(err.message);
    log(`Error completing entry: ${err}`);
  }
});

els.forms.bed.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    hospital: Number(els.hospitalId.value),
    department: e.target.departmentBed.value ? Number(e.target.departmentBed.value) : null,
    label: e.target.label.value,
    status: e.target.status.value,
    patient_name: e.target.patientBed.value,
  };
  try {
    const data = await postJSON(`${apiBase}/api/beds/`, body);
    log(`Added bed ${data.label}`);
    fetchLive();
  } catch (err) {
    alert(err.message);
    log(`Error creating bed: ${err}`);
  }
});

els.connectBtn.addEventListener('click', connectSocket);
document.getElementById('pollBtn').addEventListener('click', fetchLive);

log('Ready. Enter hospital id then Connect.');
