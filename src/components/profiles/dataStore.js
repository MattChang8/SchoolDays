import defaultProfiles from './profiles.json';
import defaultTimesheet from './timesheet.json';
import { buildApiUrl } from './api.js';

const PROFILE_STORAGE_KEY = 'schooldays.demo.profiles';
const TIMESHEET_STORAGE_KEY = 'schooldays.demo.timesheet';
const DEMO_SEED_VERSION_KEY = 'schooldays.demo.seedVersion';
const CLOCK_STORAGE_PREFIX = 'schooldays.timeclock.';

function buildSeedVersion() {
  const seedSource = JSON.stringify({
    profiles: defaultProfiles || {},
    timesheet: defaultTimesheet || {}
  });

  let hash = 0;
  for (let index = 0; index < seedSource.length; index += 1) {
    hash = ((hash << 5) - hash + seedSource.charCodeAt(index)) | 0;
  }

  return `demo-${Math.abs(hash)}`;
}

const CURRENT_DEMO_SEED_VERSION = buildSeedVersion();

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isHostedDemoMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  const host = window.location.hostname.toLowerCase();
  return host.endsWith('github.io');
}

function readStoredJson(key, fallbackValue) {
  if (!canUseStorage()) {
    return cloneData(fallbackValue);
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return cloneData(fallbackValue);
    }
    return JSON.parse(raw);
  } catch (error) {
    return cloneData(fallbackValue);
  }
}

function writeStoredJson(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function clearClockSessions() {
  if (!canUseStorage()) {
    return;
  }

  const keysToDelete = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const currentKey = window.localStorage.key(index);
    if (currentKey && currentKey.startsWith(CLOCK_STORAGE_PREFIX)) {
      keysToDelete.push(currentKey);
    }
  }

  keysToDelete.forEach((key) => window.localStorage.removeItem(key));
}

function seedDemoDataFromBundledJson(forceReset = false) {
  if (!canUseStorage()) {
    return false;
  }

  const storedSeedVersion = window.localStorage.getItem(DEMO_SEED_VERSION_KEY);
  if (!forceReset && storedSeedVersion === CURRENT_DEMO_SEED_VERSION) {
    return false;
  }

  writeStoredJson(PROFILE_STORAGE_KEY, cloneData(defaultProfiles || {}));
  writeStoredJson(TIMESHEET_STORAGE_KEY, cloneData(defaultTimesheet || {}));
  window.localStorage.setItem(DEMO_SEED_VERSION_KEY, CURRENT_DEMO_SEED_VERSION);
  clearClockSessions();
  return true;
}

export function readProfilesLocal() {
  seedDemoDataFromBundledJson();
  return readStoredJson(PROFILE_STORAGE_KEY, defaultProfiles || {});
}

export function readTimesheetLocal() {
  seedDemoDataFromBundledJson();
  return readStoredJson(TIMESHEET_STORAGE_KEY, defaultTimesheet || {});
}

function writeProfilesLocal(profiles) {
  writeStoredJson(PROFILE_STORAGE_KEY, profiles);
}

function writeTimesheetLocal(timesheet) {
  writeStoredJson(TIMESHEET_STORAGE_KEY, timesheet);
}

export function resetDemoDataToBundled() {
  if (!canUseStorage()) {
    return false;
  }

  return seedDemoDataFromBundledJson(true);
}

function updateProfileLocal(profileId, { updates, currentPassword }) {
  const profiles = readProfilesLocal();
  const currentProfile = profiles[profileId];

  if (!currentProfile) {
    return {
      ok: false,
      error: 'Profile not found.'
    };
  }

  if ((currentProfile.password || '') !== (currentPassword || '')) {
    return {
      ok: false,
      error: 'Password is incorrect.'
    };
  }

  profiles[profileId] = {
    ...currentProfile,
    ...updates,
    id: currentProfile.id
  };

  writeProfilesLocal(profiles);

  return {
    ok: true,
    profiles,
    profile: profiles[profileId],
    source: 'local'
  };
}

function appendTimesheetHoursLocal(profileId, { dateKey, hoursToAdd }) {
  const parsedHoursToAdd = Number(hoursToAdd);
  if (!dateKey || !Number.isFinite(parsedHoursToAdd) || parsedHoursToAdd <= 0) {
    return {
      ok: false,
      error: 'Invalid timesheet update.'
    };
  }

  const timesheet = readTimesheetLocal();
  const profiles = readProfilesLocal();
  const profileTimesheet = timesheet[profileId] || {};

  const existingHours = Number(profileTimesheet[dateKey]) || 0;
  const nextHours = existingHours + parsedHoursToAdd;
  profileTimesheet[dateKey] = Number(nextHours.toFixed(2)).toString();
  timesheet[profileId] = profileTimesheet;

  if (profiles[profileId]) {
    const currentAccrued = Number(profiles[profileId].accruedTimeOff) || 0;
    const accrualIncrement = parsedHoursToAdd / 30;
    profiles[profileId].accruedTimeOff = Number((currentAccrued + accrualIncrement).toFixed(4));
    writeProfilesLocal(profiles);
  }

  writeTimesheetLocal(timesheet);

  return {
    ok: true,
    timesheet,
    profileTimesheet,
    profiles,
    dateKey,
    totalHoursForDate: profileTimesheet[dateKey],
    source: 'local'
  };
}

export async function fetchProfilesData() {
  if (isHostedDemoMode()) {
    return {
      profiles: readProfilesLocal(),
      source: 'local'
    };
  }

  try {
    const response = await fetch(buildApiUrl('/api/profiles'));
    if (!response.ok) {
      throw new Error('Profile API unavailable');
    }

    const payload = await response.json();
    if (payload?.profiles) {
      return {
        profiles: payload.profiles,
        source: 'api'
      };
    }
  } catch (error) {
    return {
      profiles: readProfilesLocal(),
      source: 'local'
    };
  }

  return null;
}

export async function updateProfileData(profileId, { updates, currentPassword }) {
  if (isHostedDemoMode()) {
    return updateProfileLocal(profileId, { updates, currentPassword });
  }

  try {
    const response = await fetch(buildApiUrl(`/api/profiles/${profileId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updates, currentPassword })
    });

    const payload = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error || 'Failed to update profile.'
      };
    }

    return {
      ok: true,
      profiles: payload?.profiles,
      profile: payload?.profile,
      source: 'api'
    };
  } catch (error) {
    return updateProfileLocal(profileId, { updates, currentPassword });
  }
}

export async function fetchTimesheetData() {
  if (isHostedDemoMode()) {
    return {
      timesheet: readTimesheetLocal(),
      source: 'local'
    };
  }

  try {
    const response = await fetch(buildApiUrl('/api/timesheet'));
    if (!response.ok) {
      throw new Error('Timesheet API unavailable');
    }

    const payload = await response.json();
    if (payload?.timesheet) {
      return {
        timesheet: payload.timesheet,
        source: 'api'
      };
    }
  } catch (error) {
    return {
      timesheet: readTimesheetLocal(),
      source: 'local'
    };
  }

  return null;
}

export async function appendTimesheetHours(profileId, { dateKey, hoursToAdd }) {
  if (isHostedDemoMode()) {
    return appendTimesheetHoursLocal(profileId, { dateKey, hoursToAdd });
  }

  try {
    const response = await fetch(buildApiUrl(`/api/timesheet/${profileId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dateKey, hoursToAdd })
    });

    const payload = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error || 'Could not save time entry.'
      };
    }

    return {
      ok: true,
      ...payload,
      source: 'api'
    };
  } catch (error) {
    return appendTimesheetHoursLocal(profileId, { dateKey, hoursToAdd });
  }
}
