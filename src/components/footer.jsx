import React from "react";
import { Link } from "react-router-dom";
import { useProfile } from "./profiles/profileContext.jsx";

import './css/footer.css';

const FIELD_LABELS = {
    title: 'Job Title',
    email: 'Work Email',
    username: 'Username',
    password: 'Password',
    warehouseTraining: 'Warehouse Training Required',
    ladderTraining: 'Ladder Training Required',
    knifeSafetyTraining: 'Knife Safety Training Required',
    accruedTimeOff: 'Accrued Time Off',
    paidSickLeave: 'Paid Sick Leave'
};

const FIELD_ORDER = [
    'title',
    'email',
    'username',
    'password',
    'warehouseTraining',
    'ladderTraining',
    'knifeSafetyTraining',
    'accruedTimeOff',
    'paidSickLeave'
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function labelForField(fieldKey) {
    if (FIELD_LABELS[fieldKey]) {
        return FIELD_LABELS[fieldKey];
    }

    return fieldKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (value) => value.toUpperCase());
}

function coerceFieldValue(fieldKey, nextValue, currentValue) {
    if (typeof currentValue === 'boolean') {
        return Boolean(nextValue);
    }

    if (typeof currentValue === 'number') {
        const parsed = Number(nextValue);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return nextValue;
}

function validateDraftValues(draftValues, activeProfileId) {
    const nextErrors = {};
    const title = String(draftValues.title || '').trim();
    const email = String(draftValues.email || '').trim();
    const username = String(draftValues.username || '').trim();
    const password = String(draftValues.password || '');
    const accruedTimeOff = Number(draftValues.accruedTimeOff);
    const paidSickLeave = Number(draftValues.paidSickLeave);

    if (!title) {
        nextErrors.title = 'Job title is required.';
    }

    if (!email) {
        nextErrors.email = 'Work email is required.';
    } else if (!EMAIL_PATTERN.test(email)) {
        nextErrors.email = 'Enter a valid work email.';
    }

    if (activeProfileId !== 'default' && !username) {
        nextErrors.username = 'Username is required for employee profiles.';
    } else if (username && /\s/.test(username)) {
        nextErrors.username = 'Username cannot contain spaces.';
    } else if (username && username.length < 3) {
        nextErrors.username = 'Username must be at least 3 characters.';
    }

    if (username && password.length < 4) {
        nextErrors.password = 'Password must be at least 4 characters.';
    }

    if (!Number.isFinite(accruedTimeOff)) {
        nextErrors.accruedTimeOff = 'Accrued time off must be a valid number.';
    } else if (accruedTimeOff < 0) {
        nextErrors.accruedTimeOff = 'Accrued time off cannot be negative.';
    }

    if (!Number.isFinite(paidSickLeave)) {
        nextErrors.paidSickLeave = 'Paid sick leave must be a valid number.';
    } else if (paidSickLeave < 0) {
        nextErrors.paidSickLeave = 'Paid sick leave cannot be negative.';
    }

    return nextErrors;
}

const Footer = () => {
    const { activeProfile, activeProfileId, updateActiveProfile } = useProfile();
    const [isConsoleOpen, setIsConsoleOpen] = React.useState(false);
    const [draftValues, setDraftValues] = React.useState({});
    const [isSaving, setIsSaving] = React.useState(false);
    const [saveMessage, setSaveMessage] = React.useState('');
    const [saveError, setSaveError] = React.useState('');
    const [validationErrors, setValidationErrors] = React.useState({});

    const editableKeys = React.useMemo(() => {
        const profileKeys = Object.keys(activeProfile || {}).filter((key) => key !== 'id');
        return FIELD_ORDER.filter((key) => profileKeys.includes(key));
    }, [activeProfile]);

    const openConsole = React.useCallback(() => {
        const nextDraftValues = editableKeys.reduce((result, fieldKey) => {
            result[fieldKey] = activeProfile?.[fieldKey] ?? '';
            return result;
        }, {});

        setDraftValues(nextDraftValues);
        setValidationErrors({});
        setSaveMessage('');
        setSaveError('');
        setIsConsoleOpen(true);
    }, [activeProfile, editableKeys]);

    const closeConsole = React.useCallback(() => {
        setIsConsoleOpen(false);
        setValidationErrors({});
        setSaveMessage('');
        setSaveError('');
    }, []);

    const handleFieldChange = React.useCallback((fieldKey, nextValue) => {
        setDraftValues((current) => ({
            ...current,
            [fieldKey]: nextValue
        }));
        setValidationErrors((current) => {
            if (!current[fieldKey]) {
                return current;
            }

            const nextErrors = { ...current };
            delete nextErrors[fieldKey];
            return nextErrors;
        });
    }, []);

    const handleSave = React.useCallback(async () => {
        if (!activeProfile) {
            return;
        }

        const nextValidationErrors = validateDraftValues(draftValues, activeProfileId);
        if (Object.keys(nextValidationErrors).length > 0) {
            setValidationErrors(nextValidationErrors);
            setSaveMessage('');
            setSaveError('Resolve the validation errors before saving.');
            return;
        }

        setIsSaving(true);
        setValidationErrors({});
        setSaveMessage('');
        setSaveError('');

        const updates = editableKeys.reduce((result, fieldKey) => {
            result[fieldKey] = coerceFieldValue(fieldKey, draftValues[fieldKey], activeProfile[fieldKey]);
            return result;
        }, {});

        const response = await updateActiveProfile({
            updates,
            currentPassword: activeProfile.password || ''
        });

        if (!response?.ok) {
            setSaveError(response?.error || 'Failed to update profile.');
            setIsSaving(false);
            return;
        }

        setSaveMessage('Profile values updated.');
        setIsSaving(false);
    }, [activeProfile, activeProfileId, draftValues, editableKeys, updateActiveProfile]);

    return (
        <div className="box">
            <div className="footer-container">
                <div className="row">
                    <div className="column col1">
                        <Link to="/"> <img className="footer-logo" src={require('../components/images/SchoolDayLogo.png')} alt="jc logo"></img></Link>
                        <p className="footer-info">191 Baypointe Pkwy<br />San Jose, CA 95134</p>
                        <p className="footer-info"><strong>Phone: </strong>408-298-5100</p>
                    </div>
                    <div className="column footer-console-column">
                        <p className="heading">Profile Admin</p>
                        <p className="footer-info">Edit admin-managed profile values directly.</p>
                        <button type="button" className="footer-console-button" onClick={openConsole}>
                            Open Admin Console
                        </button>
                    </div>
                </div>
            </div>
            <h4 className="copyright">&#169;2026 Matt Chang</h4>

            {isConsoleOpen && (
                <div className="footer-modal-overlay" onClick={closeConsole}>
                    <div
                        className="footer-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Profile admin console"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="footer-modal-header">
                            <div>
                                <h3 className="footer-modal-title">Profile Admin Console</h3>
                                <p className="footer-modal-subtitle">Editing profile: <strong>{activeProfileId}</strong></p>
                            </div>
                            <button type="button" className="footer-modal-close" onClick={closeConsole}>
                                Close
                            </button>
                        </div>

                        <div className="footer-readonly-row">
                            <span>Profile ID</span>
                            <strong>{activeProfile?.id || activeProfileId}</strong>
                        </div>

                        <div className="footer-form-grid">
                            {editableKeys.map((fieldKey) => {
                                const currentValue = activeProfile?.[fieldKey];
                                const draftValue = draftValues[fieldKey];
                                const label = labelForField(fieldKey);
                                const fieldError = validationErrors[fieldKey];

                                if (typeof currentValue === 'boolean') {
                                    return (
                                        <label className="footer-field" key={fieldKey}>
                                            <span>{label}</span>
                                            <select
                                                value={String(Boolean(draftValue))}
                                                onChange={(event) => handleFieldChange(fieldKey, event.target.value === 'true')}
                                            >
                                                <option value="true">Required / True</option>
                                                <option value="false">Complete / False</option>
                                            </select>
                                            {fieldError && <span className="footer-field-error">{fieldError}</span>}
                                        </label>
                                    );
                                }

                                const inputType = fieldKey === 'password'
                                    ? 'password'
                                    : (fieldKey === 'email' ? 'email' : (typeof currentValue === 'number' ? 'number' : 'text'));

                                return (
                                    <label className="footer-field" key={fieldKey}>
                                        <span>{label}</span>
                                        <input
                                            type={inputType}
                                            step={typeof currentValue === 'number' ? '0.0001' : undefined}
                                            value={draftValue ?? ''}
                                            onChange={(event) => handleFieldChange(fieldKey, event.target.value)}
                                        />
                                        {fieldError && <span className="footer-field-error">{fieldError}</span>}
                                    </label>
                                );
                            })}
                        </div>

                        <div className="footer-modal-actions">
                            <button type="button" className="footer-modal-secondary" onClick={closeConsole}>
                                Cancel
                            </button>
                            <button type="button" className="footer-console-button" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        {saveMessage && <p className="footer-modal-success">{saveMessage}</p>}
                        {saveError && <p className="footer-modal-error">{saveError}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Footer;
