import React from 'react';
import '../components/css/workday.css';
import '../components/css/payroll.css';
import { useProfile } from '../components/profiles/profileContext.jsx';
import timesheetData from '../components/profiles/timesheet.json';

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return normalizeDate(next);
}

function parseTimesheetDate(dateKey) {
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

function formatDate(value) {
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getMostRecentFriday(referenceDate) {
  const reference = normalizeDate(referenceDate);
  const daysSinceFriday = (reference.getDay() - 5 + 7) % 7;
  const periodEnd = addDays(reference, -daysSinceFriday);
  return periodEnd;
}

function makePayStubId(profileId, periodEnd) {
  const year = periodEnd.getFullYear();
  const month = String(periodEnd.getMonth() + 1).padStart(2, '0');
  const day = String(periodEnd.getDate()).padStart(2, '0');
  return `${String(profileId || 'default').toUpperCase()}-${year}${month}${day}`;
}

export function Payroll() {
  const { activeProfileId, activeProfile } = useProfile();
  const [timesheetMap, setTimesheetMap] = React.useState(timesheetData || {});

  React.useEffect(() => {
    const fetchTimesheet = async () => {
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
        // Keep local JSON fallback if API is unavailable.
      }
    };

    fetchTimesheet();
  }, []);

  const activeTimesheet = timesheetMap[activeProfileId] || timesheetMap.default || {};

  const periodEnd = getMostRecentFriday(new Date());
  const periodStart = addDays(periodEnd, -6);
  const nextPayDate = addDays(periodEnd, 7);

  const payrollRows = Object.entries(activeTimesheet)
    .map(([dateKey, hoursText]) => {
      const workDate = parseTimesheetDate(dateKey);
      const hours = Number(hoursText) || 0;
      return {
        dateKey,
        workDate,
        hours
      };
    })
    .filter((row) => row.workDate && row.workDate >= periodStart && row.workDate <= periodEnd)
    .sort((a, b) => a.workDate - b.workDate);

  const totalHours = payrollRows.reduce((total, row) => total + row.hours, 0);
  const hourlyRate = Number(activeProfile?.hourlyRate) || 0;
  const grossPay = totalHours * hourlyRate;
  const estimatedTaxes = grossPay * 0.18;
  const netPay = grossPay - estimatedTaxes;

  const employeeName = [activeProfile?.firstName, activeProfile?.lastName].filter(Boolean).join(' ') || 'Employee';
  const employeeTitle = activeProfile?.title || 'Team Member';
  const payStubId = makePayStubId(activeProfileId, periodEnd);

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`}
      </style>

      <div className="payrollPage">
        <div className="largeTitle">
          <h>Payroll</h>
        </div>
        <p className="payrollSubtitle">Weekly payroll cycle (closed every Friday).</p>

        <div className="payrollGrid">
          <section className="payrollCard">
            <h3 className="payrollLabel">Employee</h3>
            <p className="payrollValue">{employeeName}</p>
            <p className="payrollMuted">{employeeTitle}</p>
            <p className="payrollMuted">Paystub ID: {payStubId}</p>
          </section>

          <section className="payrollCard">
            <h3 className="payrollLabel">Current Closed Period</h3>
            <p className="payrollValue">{formatDate(periodStart)} - {formatDate(periodEnd)}</p>
            <p className="payrollMuted">Next Pay Date: {formatDate(nextPayDate)}</p>
          </section>

          <section className="payrollCard">
            <h3 className="payrollLabel">Hours & Rate</h3>
            <p className="payrollValue">{totalHours.toFixed(2)} hrs</p>
            <p className="payrollMuted">Hourly Rate: {formatCurrency(hourlyRate)}</p>
          </section>

          <section className="payrollCard payrollCardHighlight">
            <h3 className="payrollLabel">Estimated Net Pay</h3>
            <p className="payrollValue">{formatCurrency(netPay)}</p>
            <p className="payrollMuted">Gross: {formatCurrency(grossPay)}</p>
          </section>
        </div>

        <section className="payrollPanel">
          <h3 className="mediumHeading">Earnings Detail</h3>
          <table className="payrollTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Hours</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payrollRows.length === 0 && (
                <tr>
                  <td colSpan={4}>No timesheet hours found for this payroll period.</td>
                </tr>
              )}
              {payrollRows.map((row) => (
                <tr key={row.dateKey}>
                  <td>{row.dateKey}</td>
                  <td>{row.hours.toFixed(2)}</td>
                  <td>{formatCurrency(hourlyRate)}</td>
                  <td>{formatCurrency(row.hours * hourlyRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="payrollTwoCol">
          <section className="payrollPanel">
            <h3 className="mediumHeading">Payroll Summary</h3>
            <div className="payrollSummaryRow">
              <span>Gross Pay</span>
              <strong>{formatCurrency(grossPay)}</strong>
            </div>
            <div className="payrollSummaryRow">
              <span>Estimated Taxes (18%)</span>
              <strong>-{formatCurrency(estimatedTaxes)}</strong>
            </div>
            <div className="payrollSummaryRow payrollSummaryTotal">
              <span>Estimated Net Pay</span>
              <strong>{formatCurrency(netPay)}</strong>
            </div>
          </section>

          <section className="payrollPanel">
            <h3 className="mediumHeading">Payment Method</h3>
            <p className="payrollMuted">Direct Deposit</p>
            <p className="payrollMuted">Bank: Your Bank</p>
            <p className="payrollMuted">Account: ****1234</p>
            <button className="payrollButton" type="button">Download Paystub</button>
          </section>
        </div>
      </div>
    </>
  );
}
