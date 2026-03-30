const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const profilesFilePath = path.join(__dirname, 'src', 'components', 'profiles', 'profiles.json');
const timesheetFilePath = path.join(__dirname, 'src', 'components', 'profiles', 'timesheet.json');
const tavusApiKey = process.env.TAVUS_API_KEY;
const tavusReplicaId = process.env.TAVUS_REPLICA_ID;
const tavusPersonaId = process.env.TAVUS_PERSONA_ID;
const tavusRequireAuth = String(process.env.TAVUS_REQUIRE_AUTH || 'false').toLowerCase() === 'true';
const tavusMaxParticipants = Number(process.env.TAVUS_MAX_PARTICIPANTS || 2);
const allowedOrigins = String(
  process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,https://mattchang8.github.io'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(express.json());
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (!requestOrigin) {
    next();
    return;
  }

  if (allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

async function readProfiles() {
  const raw = await fs.readFile(profilesFilePath, 'utf8');
  return JSON.parse(raw);
}

async function writeProfiles(profiles) {
  const formatted = JSON.stringify(profiles, null, 2);
  await fs.writeFile(profilesFilePath, `${formatted}\n`, 'utf8');
}

async function readTimesheet() {
  const raw = await fs.readFile(timesheetFilePath, 'utf8');
  return JSON.parse(raw);
}

async function writeTimesheet(timesheet) {
  const formatted = JSON.stringify(timesheet, null, 2);
  await fs.writeFile(timesheetFilePath, `${formatted}\n`, 'utf8');
}

function buildTavusConversationPayload(requestBody = {}) {
  const payload = {
    replica_id: requestBody.replicaId || tavusReplicaId,
    persona_id: requestBody.personaId || tavusPersonaId,
    conversation_name: requestBody.conversationName || 'SchoolDays Tavus Demo',
    conversational_context: requestBody.conversationalContext || 'You are assisting a SchoolDays employee inside an HCM demo environment.',
    custom_greeting: requestBody.customGreeting || 'Hi, how can I help you today?',
    require_auth: typeof requestBody.requireAuth === 'boolean' ? requestBody.requireAuth : tavusRequireAuth,
    max_participants: Number.isFinite(Number(requestBody.maxParticipants))
      ? Number(requestBody.maxParticipants)
      : tavusMaxParticipants
  };

  if (typeof requestBody.audioOnly === 'boolean') {
    payload.audio_only = requestBody.audioOnly;
  }

  if (typeof requestBody.testMode === 'boolean') {
    payload.test_mode = requestBody.testMode;
  }

  return payload;
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'schooldays-api',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await readProfiles();
    res.json({ profiles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read profiles.' });
  }
});

app.put('/api/profiles/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    const { updates, currentPassword } = req.body || {};

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Missing profile updates.' });
    }

    const profiles = await readProfiles();
    const currentProfile = profiles[profileId];

    if (!currentProfile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    if ((currentProfile.password || '') !== (currentPassword || '')) {
      return res.status(401).json({ error: 'Password is incorrect.' });
    }

    profiles[profileId] = {
      ...currentProfile,
      ...updates,
      id: currentProfile.id
    };

    await writeProfiles(profiles);
    return res.json({ profiles, profile: profiles[profileId] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

app.get('/api/timesheet', async (req, res) => {
  try {
    const timesheet = await readTimesheet();
    res.json({ timesheet });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read timesheet.' });
  }
});

app.put('/api/timesheet/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    const { dateKey, hoursToAdd } = req.body || {};

    if (!dateKey || typeof dateKey !== 'string') {
      return res.status(400).json({ error: 'Missing dateKey.' });
    }

    const parsedHoursToAdd = Number(hoursToAdd);
    if (!Number.isFinite(parsedHoursToAdd) || parsedHoursToAdd <= 0) {
      return res.status(400).json({ error: 'hoursToAdd must be a positive number.' });
    }

    const timesheet = await readTimesheet();
    const profiles = await readProfiles();
    const profileTimesheet = timesheet[profileId] || {};

    const existingHours = Number(profileTimesheet[dateKey]) || 0;
    const nextHours = existingHours + parsedHoursToAdd;
    profileTimesheet[dateKey] = Number(nextHours.toFixed(2)).toString();
    timesheet[profileId] = profileTimesheet;

    if (profiles[profileId]) {
      const currentAccrued = Number(profiles[profileId].accruedTimeOff) || 0;
      const accrualIncrement = parsedHoursToAdd / 30;
      const nextAccrued = currentAccrued + accrualIncrement;
      profiles[profileId].accruedTimeOff = Number(nextAccrued.toFixed(4));
      await writeProfiles(profiles);
    }

    await writeTimesheet(timesheet);

    return res.json({
      timesheet,
      profileTimesheet,
      dateKey,
      totalHoursForDate: profileTimesheet[dateKey],
      profiles
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update timesheet.' });
  }
});

app.post('/api/tavus/conversation', async (req, res) => {
  if (!tavusApiKey) {
    return res.status(500).json({ error: 'Missing TAVUS_API_KEY in server environment.' });
  }

  const payload = buildTavusConversationPayload(req.body || {});

  if (!payload.replica_id || !payload.persona_id) {
    return res.status(500).json({ error: 'Missing TAVUS_REPLICA_ID or TAVUS_PERSONA_ID in server environment.' });
  }

  try {
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    let tavusPayload = {};

    try {
      tavusPayload = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
      tavusPayload = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: tavusPayload?.error || tavusPayload?.message || 'Failed to create Tavus conversation.',
        tavus: tavusPayload
      });
    }

    return res.json({
      conversationId: tavusPayload.conversation_id,
      conversationName: tavusPayload.conversation_name,
      conversationUrl: tavusPayload.conversation_url,
      meetingToken: tavusPayload.meeting_token || null,
      status: tavusPayload.status,
      tavus: tavusPayload
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to reach Tavus API.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Profile API listening on http://localhost:${PORT}`);
});
