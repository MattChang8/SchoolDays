const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const profilesFilePath = path.join(__dirname, 'src', 'components', 'profiles', 'profiles.json');
const timesheetFilePath = path.join(__dirname, 'src', 'components', 'profiles', 'timesheet.json');

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Profile API listening on http://localhost:${PORT}`);
});
