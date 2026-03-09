import React from 'react';
import { Link } from 'react-router-dom';
import '../components/css/workday.css';
import '../components/css/dashboard.css';
import { useProfile } from '../components/profiles/profileContext.jsx';

const TRAINING_KEYS = [
  { key: 'warehouseTraining', label: 'Warehouse Safety' },
  { key: 'ladderTraining', label: 'Ladder Safety' },
  { key: 'knifeSafetyTraining', label: 'Knife Safety' }
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const PAYROLL_ANCHOR_FRIDAY = new Date(2026, 0, 2);

function getClockStorageKey(profileId) {
  return `schooldays.timeclock.${profileId || 'default'}`;
}

function readClockSession(profileId) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getClockStorageKey(profileId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeClockSession(profileId, session) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(getClockStorageKey(profileId), JSON.stringify(session));
}

function clearClockSession(profileId) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(getClockStorageKey(profileId));
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return normalizeDate(next);
}

function getDateKeyForToday() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const yearTwoDigits = String(now.getFullYear()).slice(-2);
  return `${month}/${day}/${yearTwoDigits}`;
}

function parseDateKey(dateKey) {
  const [monthRaw, dayRaw, yearRaw] = String(dateKey).split('/');
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const year = Number(yearRaw);
  const fullYear = year < 100 ? 2000 + year : year;

  if (!month || !day || !fullYear) {
    return null;
  }

  return new Date(fullYear, month - 1, day);
}


function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
}

function getMostRecentBiweeklyFriday(referenceDate) {
  const reference = normalizeDate(referenceDate);
  const anchor = normalizeDate(PAYROLL_ANCHOR_FRIDAY);
  const diffDays = Math.floor((reference.getTime() - anchor.getTime()) / MS_PER_DAY);
  const cyclesSinceAnchor = Math.floor(diffDays / 14);
  let periodEnd = addDays(anchor, cyclesSinceAnchor * 14);

  if (periodEnd > reference) {
    periodEnd = addDays(periodEnd, -14);
  }

  return periodEnd;
}

export function Dashboard() {
  const { activeProfileId, activeProfile } = useProfile();
  const displayName = activeProfile
    ? [activeProfile.firstName, activeProfile.lastName].filter(Boolean).join(' ')
    : 'Default User';

  const [timesheetMap, setTimesheetMap] = React.useState({});
  const [isClockedIn, setIsClockedIn] = React.useState(false);
  const [clockInTime, setClockInTime] = React.useState(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [lastSessionSeconds, setLastSessionSeconds] = React.useState(0);
  const [clockStateLoaded, setClockStateLoaded] = React.useState(false);
  const [clockSessionProfileId, setClockSessionProfileId] = React.useState(null);
  const [isSavingClock, setIsSavingClock] = React.useState(false);
  const [clockMessage, setClockMessage] = React.useState('');
  const [clockError, setClockError] = React.useState('');

  const fetchTimesheet = React.useCallback(async () => {
    try {
      const response = await fetch('/api/timesheet');
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      if (payload?.timesheet) {
        setTimesheetMap(payload.timesheet);
      }
    } catch (error) {
      setClockError('Unable to load timesheet data.');
    }
  }, []);

  React.useEffect(() => {
    fetchTimesheet();
  }, [fetchTimesheet]);

  React.useEffect(() => {
    setClockStateLoaded(false);
    setClockSessionProfileId(null);

    const savedSession = readClockSession(activeProfileId);
    if (!savedSession?.isClockedIn || !savedSession?.clockInTimeIso) {
      setIsClockedIn(false);
      setClockInTime(null);
      setElapsedSeconds(0);
      setClockStateLoaded(true);
      setClockSessionProfileId(activeProfileId);
      return;
    }

    const restoredClockIn = new Date(savedSession.clockInTimeIso);
    if (Number.isNaN(restoredClockIn.getTime())) {
      clearClockSession(activeProfileId);
      setIsClockedIn(false);
      setClockInTime(null);
      setElapsedSeconds(0);
      setClockStateLoaded(true);
      setClockSessionProfileId(activeProfileId);
      return;
    }

    setClockInTime(restoredClockIn);
    setIsClockedIn(true);
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - restoredClockIn.getTime()) / 1000)));
    setClockStateLoaded(true);
    setClockSessionProfileId(activeProfileId);
  }, [activeProfileId]);

  React.useEffect(() => {
    if (!clockStateLoaded || clockSessionProfileId !== activeProfileId) {
      return;
    }

    if (isClockedIn && clockInTime) {
      writeClockSession(activeProfileId, {
        isClockedIn: true,
        clockInTimeIso: clockInTime.toISOString()
      });
      return;
    }

    clearClockSession(activeProfileId);
  }, [clockStateLoaded, clockSessionProfileId, isClockedIn, clockInTime, activeProfileId]);

  React.useEffect(() => {
    if (!isClockedIn || !clockInTime) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      const nowMs = Date.now();
      const startMs = clockInTime.getTime();
      setElapsedSeconds(Math.floor((nowMs - startMs) / 1000));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isClockedIn, clockInTime]);

  const appendWorkedTime = React.useCallback(async (workedSeconds) => {
    const hoursToAdd = workedSeconds / 3600;
    if (hoursToAdd <= 0) {
      return;
    }

    setIsSavingClock(true);
    setClockMessage('');
    setClockError('');

    try {
      const response = await fetch(`/api/timesheet/${activeProfileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateKey: getDateKeyForToday(),
          hoursToAdd
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        setClockError(payload?.error || 'Could not save clock session.');
        setIsSavingClock(false);
        return;
      }

      if (payload?.timesheet) {
        setTimesheetMap(payload.timesheet);
      } else {
        fetchTimesheet();
      }

      setClockMessage(`Saved ${hoursToAdd.toFixed(2)} hour(s) to today's timesheet.`);
    } catch (error) {
      setClockError('Could not reach timesheet API.');
    } finally {
      setIsSavingClock(false);
    }
  }, [activeProfileId, fetchTimesheet]);

  const handleClockIn = () => {
    const now = new Date();
    setClockInTime(now);
    setElapsedSeconds(0);
    setLastSessionSeconds(0);
    setClockMessage('');
    setClockError('');
    setIsClockedIn(true);
  };

  const handleClockOut = async () => {
    if (!clockInTime) {
      return;
    }

    const workedSeconds = Math.max(0, Math.floor((Date.now() - clockInTime.getTime()) / 1000));
    setLastSessionSeconds(workedSeconds);
    setIsClockedIn(false);
    setClockInTime(null);
    setElapsedSeconds(0);
    await appendWorkedTime(workedSeconds);
  };

  const currentTimesheet = timesheetMap[activeProfileId] || timesheetMap.default || {};
  //const todayHours = Number(currentTimesheet[getDateKeyForToday()]) || 0;
  const requiredTrainings = TRAINING_KEYS.filter((item) => Boolean(activeProfile?.[item.key]));
  const requiredTrainingCount = requiredTrainings.length;

  const periodEnd = getMostRecentBiweeklyFriday(new Date());
  const periodStart = addDays(periodEnd, -13);
  const periodEntries = Object.entries(currentTimesheet)
    .map(([dateKey, hoursText]) => ({
      parsedDate: parseDateKey(dateKey),
      hours: Number(hoursText) || 0
    }))
    .filter((entry) => entry.parsedDate && entry.parsedDate >= periodStart && entry.parsedDate <= periodEnd);
  const periodHours = periodEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const hourlyRate = Number(activeProfile?.hourlyRate) || 0;
  const estimatedGross = periodHours * hourlyRate;

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`}
      </style>

      <div className="dashboardPage">
        <div className="largeTitle">
          <h>Dashboard</h>
        </div>
        <p className="dashboardWelcome">Welcome, {displayName}</p>

        <section className="dashboardClockCard">
          <div className="dashboardClockHeader">
            <h className="mediumHeading">Clock In/Out</h>
            <p>{isClockedIn ? `Clocked in at ${clockInTime?.toLocaleTimeString()}` : 'Ready to clock in'}</p>
          </div>
          <div className="dashboardClockActions">
            <button onClick={handleClockIn} disabled={isClockedIn || isSavingClock}>Clock In</button>
            <button onClick={handleClockOut} disabled={!isClockedIn || isSavingClock}>Clock Out & Save</button>
            <Link to="/time" className="dashboardActionLink">Open Time Page</Link>
          </div>
          {clockMessage && <p className="dashboardSuccess">{clockMessage}</p>}
          {clockError && <p className="dashboardError">{clockError}</p>}
        </section>

        <section className="dashboardGrid">
          <article className="dashboardCard">
            <h3>Required Training</h3>
            {requiredTrainingCount === 0 && <p>All assigned modules complete.</p>}
            {requiredTrainingCount > 0 && (
              <ul>
                {requiredTrainings.map((item) => (
                  <li key={item.key}>{item.label}</li>
                ))}
              </ul>
            )}
            <Link to="/training" className="dashboardActionLink">Go to Training</Link>
          </article>

          <article className="dashboardCard">
            <h3>Payroll Snapshot</h3>
            <p>Current Period Hours: <strong>{periodHours.toFixed(2)}</strong></p>
            <p>Hourly Rate: <strong>{formatCurrency(hourlyRate)}</strong></p>
            <p>Estimated Gross: <strong>{formatCurrency(estimatedGross)}</strong></p>
            <Link to="/payroll" className="dashboardActionLink">Open Payroll</Link>
          </article>

          <article className="dashboardCard">
            <h3>Employee Info</h3>
            <p>Role: <strong>{activeProfile?.title || 'Team Member'}</strong></p>
            <p>Work Email: <strong>{activeProfile?.email || '-'}</strong></p>
            <p>Store Credit: <strong>{formatCurrency(Number(activeProfile?.storeCredit) || 0)}</strong></p>
            <Link to="/info" className="dashboardActionLink">Open Profile</Link>
          </article>

          <article className="dashboardCard">
            <h3>Quick Actions</h3>
            <p>Request time off, review benefits, or complete required tasks.</p>
            <div className="dashboardQuickLinks">
              <Link to="/absence">Request Absence</Link>
              <Link to="/benefits">View Benefits</Link>
              <Link to="/time">Time Details</Link>
            </div>
          </article>
        </section>
      </div>
    </>
  );
}
