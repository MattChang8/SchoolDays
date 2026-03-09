import '../components/css/workday.css';
import '../components/css/time.css';
import React from 'react';
import { useProfile } from '../components/profiles/profileContext.jsx';

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

function getDateKeyForToday() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const yearTwoDigits = String(now.getFullYear()).slice(-2);
  return `${month}/${day}/${yearTwoDigits}`;
}

function getClosedWeekRange(referenceDate = new Date(), weekOffset = 0) {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - mondayOffset);

  const weekEnd = new Date(startOfCurrentWeek);
  weekEnd.setDate(startOfCurrentWeek.getDate() - 1 - (weekOffset * 7));

  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - 6);

  return { weekStart, weekEnd };
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function Time() {
  const { activeProfileId } = useProfile();
  const [isClockedIn, setIsClockedIn] = React.useState(false);
  const [clockInTime, setClockInTime] = React.useState(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [lastSessionSeconds, setLastSessionSeconds] = React.useState(0);
  const [clockStateLoaded, setClockStateLoaded] = React.useState(false);
  const [clockSessionProfileId, setClockSessionProfileId] = React.useState(null);
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [timesheetMap, setTimesheetMap] = React.useState({});
  const [saveMessage, setSaveMessage] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

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
      setSaveError('Unable to connect to timesheet service.');
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

  React.useEffect(() => {
    setWeekOffset(0);
  }, [activeProfileId]);

  const appendWorkedTime = React.useCallback(async (workedSeconds) => {
    const hoursToAdd = workedSeconds / 3600;
    if (hoursToAdd <= 0) {
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

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
        setSaveError(payload?.error || 'Could not save time entry.');
        setIsSaving(false);
        return;
      }

      if (payload?.timesheet) {
        setTimesheetMap(payload.timesheet);
      } else {
        fetchTimesheet();
      }

      setSaveMessage(`Saved ${hoursToAdd.toFixed(2)} hour(s) to today's timesheet.`);
    } catch (error) {
      setSaveError('Could not reach timesheet API.');
    } finally {
      setIsSaving(false);
    }
  }, [activeProfileId, fetchTimesheet]);

  const handleClockIn = () => {
    const now = new Date();
    setClockInTime(now);
    setElapsedSeconds(0);
    setLastSessionSeconds(0);
    setSaveMessage('');
    setSaveError('');
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
  const todayHours = Number(currentTimesheet[getDateKeyForToday()]) || 0;

  const parsedEntries = Object.entries(currentTimesheet)
    .map(([dateKey, hoursText]) => ({
      dateKey,
      parsedDate: parseDateKey(dateKey),
      hours: Number(hoursText) || 0
    }))
    .filter((entry) => entry.parsedDate)
    .sort((a, b) => a.parsedDate - b.parsedDate);

  const { weekStart, weekEnd } = getClosedWeekRange(new Date(), weekOffset);

  const weeklyEntries = parsedEntries
    .filter((entry) => entry.parsedDate >= weekStart && entry.parsedDate <= weekEnd)
    .sort((a, b) => a.parsedDate - b.parsedDate);

  const earliestEntryDate = parsedEntries.length > 0 ? parsedEntries[0].parsedDate : null;
  const currentPreviousWeek = getClosedWeekRange(new Date(), 0);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const maxWeekOffset = earliestEntryDate
    ? Math.max(0, Math.floor((currentPreviousWeek.weekStart.getTime() - earliestEntryDate.getTime()) / msPerWeek))
    : 0;

  const chartEntries = weeklyEntries;
  const totalWeekHours = chartEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const maxHours = Math.max(...chartEntries.map((entry) => entry.hours), 1);

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`}
      </style>

      <div className="timePage">
        <div className="largeTitle">
          <h>Time</h>
        </div>

        <div className="timeCard timeHeroCard">
          <div>
            <h className="mediumHeading">Time Clock</h>
            <p className="timeTimer">{formatDuration(elapsedSeconds)}</p>
            <p className="timeSubtleText">
              {isClockedIn ? `Clocked in at ${clockInTime?.toLocaleTimeString()}` : 'Not clocked in'}
            </p>
          </div>
          <div className="timeStatPills">
            <div className="timePill">
              <span>Today Logged</span>
              <strong>{todayHours.toFixed(2)} hrs</strong>
            </div>
            <div className="timePill">
              <span>Last Session</span>
              <strong>{formatDuration(lastSessionSeconds)}</strong>
            </div>
          </div>
          <div className="timeButtons">
            <button onClick={handleClockIn} disabled={isClockedIn || isSaving}>Clock In</button>
            <button onClick={handleClockOut} disabled={!isClockedIn || isSaving}>Clock Out & Save</button>
          </div>
          {saveMessage && <p className="timeSuccess">{saveMessage}</p>}
          {saveError && <p className="timeError">{saveError}</p>}
        </div>

        <div className="timeCard">
          <div className="timeHistoryHeader">
            <h className="mediumHeading">Weekly Hours</h>
            <p className="timeSubtleText">
              {formatShortDate(weekStart)} - {formatShortDate(weekEnd)}
            </p>
            <div className="timeHistoryControls">
              <button
                type="button"
                onClick={() => setWeekOffset((current) => Math.min(current + 1, maxWeekOffset))}
                disabled={weekOffset >= maxWeekOffset}
              >
                Earlier Week
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((current) => Math.max(current - 1, 0))}
                disabled={weekOffset === 0}
              >
                Newer Week
              </button>
            </div>
          </div>
          <p className="bodyTextMedium">Total Hours: {totalWeekHours.toFixed(2)}</p>
          <div className="timeGraph">
            {chartEntries.length === 0 && (
              <p className="timeHistoryEmpty">No timesheet data for this week.</p>
            )}
            {chartEntries.map((entry) => {
              const barHeightPercent = (entry.hours / maxHours) * 100;
              return (
                <div className="timeBarItem" key={entry.dateKey}>
                  <span className="timeBarValue">{entry.hours.toFixed(1)}</span>
                  <div className="timeBarTrack">
                    <div
                      className="timeBarFill"
                      style={{ height: `${barHeightPercent}%` }}
                    />
                  </div>
                  <span className="timeBarLabel">{entry.dateKey}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
