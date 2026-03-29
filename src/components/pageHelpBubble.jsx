import React from 'react';
import { useLocation } from 'react-router-dom';
import './css/pageHelpBubble.css';

const PAGE_HELP_CONTENT = {
  '/': {
    title: 'Login',
    summary: 'This page authenticates the user and sets the active employee profile for the session. There are 2 profiles in this demo: Default and John Worker. Enter "guest1" into both fields to log into the John Worker profile. You can always get back to the Default profile by hitting "Logout" on the top right on the page.',
    hcmUse: 'Modern HCM platforms use sign-in to personalize dashboards, protect employee records, and control access to payroll, time, benefits, and training data. Remember to enable Two-Factor Authentication if given the option.'
  },
  '/login': {
    title: 'Login',
    summary: 'This page authenticates the user and sets the active employee profile for the session. There are 2 profiles in this demo: Default and John Worker. Enter "guest1" into both fields to log into the John Worker profile. You can always get back to the Default profile by hitting "Logout" on the top right on the page.',
    hcmUse: 'Modern HCM platforms use sign-in to personalize dashboards, protect employee records, and control access to payroll, time, benefits, and training data. Remember to enable Two-Factor Authentication if given the option.'
  },
  '/dashboard': {
    title: 'Dashboard',
    summary: 'This is the employee landing page for daily actions, alerts, payroll snapshots, and training status.',
    hcmUse: 'In modern HCMs, dashboards reduce navigation friction by surfacing the tasks a worker needs most often, such as clocking in, checking pay, and completing compliance items.'
  },
  '/time': {
    title: 'Time',
    summary: 'This page is used to clock in, clock out, and review previously worked hours by week.',
    hcmUse: 'Time modules in modern HCM suites capture labor hours, feed payroll calculations, support attendance tracking, and provide managers with audit-ready work records.'
  },
  '/payroll': {
    title: 'Payroll',
    summary: 'This page estimates pay for the active period using hours worked, pay rate, taxes, and benefit deductions.',
    hcmUse: 'Payroll pages in HCM systems help employees understand earnings, deductions, benefit costs, and pay dates without needing HR to answer routine questions.'
  },
  '/absence': {
    title: 'Absence',
    summary: 'This page lets the user request time away from work while checking available leave balances. Click the start and ending date to highlight the time you want to request off, then click "Submit Request." Each day counts for 8 hours. There may be cases where you may need to email your direct supervisor and they will manually deduct your hours after approving your time off.',
    hcmUse: 'Absence management in modern HCMs tracks accruals, validates leave requests, and gives managers a structured workflow for scheduling and coverage decisions.'
  },
  '/benefits': {
    title: 'Benefits',
    summary: 'This page shows benefit elections and lets the employee choose coverage tiers. Each company offers different benefits, so it\'s in your best interest to know what they offer and make the most of it.',
    hcmUse: 'Benefits self-service is a core HCM function because it reduces manual HR administration and lets employees manage deductions and elections directly.'
  },
  '/training': {
    title: 'Training',
    summary: 'This page assigns required learning modules, plays training content, and checks completion with quizzes. In most cases, the company will disable your ability to scrub the video to ensure that you have watched the entire training video. You will then need to pass a quiz for the training to be completed. You can open the Admin Console below to put the Finished Modules back into the Required Modules.',
    hcmUse: 'Learning and compliance modules in modern HCMs help organizations document required training, reduce risk, and maintain a record of employee completion status.'
  },
  '/info': {
    title: 'Personal Info',
    summary: 'This page displays and manages employee profile details such as contact, emergency, and employment information. To edit the profile, click on "View Info", then "Edit Info". If on the Default profile, just click "OK". If on John\'s profile, enter "guest1" and click "OK."',
    hcmUse: 'Employee self-service records are standard in modern HCMs because they keep data current and reduce administrative updates for HR staff.'
  }
};

const DEFAULT_HELP_CONTENT = {
  title: 'Page Help',
  summary: 'This page is part of the employee self-service experience.',
  hcmUse: 'Modern HCM platforms group time, pay, benefits, training, and worker records into one system so employees and managers can use shared data across workflows.'
};

export default function PageHelpBubble() {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const helpContent = PAGE_HELP_CONTENT[location.pathname] || DEFAULT_HELP_CONTENT;

  return (
    <div className="pageHelpShell">
      {isOpen && (
        <div
          id="page-help-panel"
          className="pageHelpPanel"
          role="dialog"
          aria-modal="false"
          aria-label="Page help"
        >
          <div className="pageHelpPanelHeader">
            <div>
              <p className="pageHelpEyebrow">Current Page</p>
              <h3 className="pageHelpTitle">{helpContent.title}</h3>
            </div>
            <button
              type="button"
              className="pageHelpClose"
              onClick={() => setIsOpen(false)}
              aria-label="Close page help"
            >
              X
            </button>
          </div>
          <div className="pageHelpBody">
            <p>
              <strong>What this page does:</strong> {helpContent.summary}
            </p>
            <p>
              <strong>How it fits in a modern HCM:</strong> {helpContent.hcmUse}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        className="pageHelpBubble"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="page-help-panel"
      >
        About This Page
      </button>
    </div>
  );
}
