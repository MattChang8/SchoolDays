import React from "react";
import { Link } from "react-router-dom";
import { useProfile } from "./profiles/profileContext.jsx";

import './css/footer.css';

const BENEFIT_TIER_OPTIONS = ['none', 'silver', 'gold', 'platinum'];

const FIELD_LABELS = {
    firstName: 'First Name',
    lastName: 'Last Name',
    title: 'Job Title',
    email: 'Work Email',
    username: 'Username',
    password: 'Password',
    dob: 'Date of Birth',
    homePhone: 'Home Phone',
    cellPhone: 'Cell Phone',
    homeAddress: 'Home Address',
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactNumber: 'Emergency Contact Number',
    personalEmail: 'Personal Email',
    hourlyRate: 'Hourly Rate',
    warehouseTraining: 'Warehouse Training Required',
    ladderTraining: 'Ladder Training Required',
    knifeSafetyTraining: 'Knife Safety Training Required',
    storeCredit: 'Store Credit',
    accruedTimeOff: 'Accrued Time Off',
    paidSickLeave: 'Paid Sick Leave',
    dentalTier: 'Dental Tier',
    visionTier: 'Vision Tier'
};

const FIELD_ORDER = [
    'firstName',
    'lastName',
    'title',
    'email',
    'username',
    'password',
    'dob',
    'homePhone',
    'cellPhone',
    'homeAddress',
    'emergencyContactName',
    'emergencyContactNumber',
    'personalEmail',
    'hourlyRate',
    'warehouseTraining',
    'ladderTraining',
    'knifeSafetyTraining',
    'storeCredit',
    'accruedTimeOff',
    'paidSickLeave',
    'dentalTier',
    'visionTier'
];

function labelForField(fieldKey) {
    if (FIELD_LABELS[fieldKey]) {
        return FIELD_LABELS[fieldKey];
    }

    return fieldKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (value) => value.toUpperCase());
}

function coerceFieldValue(fieldKey, nextValue, currentValue) {
    if (fieldKey === 'dentalTier' || fieldKey === 'visionTier') {
        return nextValue;
    }

    if (typeof currentValue === 'boolean') {
        return Boolean(nextValue);
    }

    if (typeof currentValue === 'number') {
        const parsed = Number(nextValue);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return nextValue;
}

const Footer = () => {
    const { activeProfile, activeProfileId, updateActiveProfile } = useProfile();
    const [isConsoleOpen, setIsConsoleOpen] = React.useState(false);
    const [draftValues, setDraftValues] = React.useState({});
    const [isSaving, setIsSaving] = React.useState(false);
    const [saveMessage, setSaveMessage] = React.useState('');
    const [saveError, setSaveError] = React.useState('');

    const editableKeys = React.useMemo(() => {
        const profileKeys = Object.keys(activeProfile || {}).filter((key) => key !== 'id');
        const orderedKeys = FIELD_ORDER.filter((key) => profileKeys.includes(key));
        const remainingKeys = profileKeys.filter((key) => !FIELD_ORDER.includes(key));
        return [...orderedKeys, ...remainingKeys];
    }, [activeProfile]);

    const openConsole = React.useCallback(() => {
        setDraftValues({ ...(activeProfile || {}) });
        setSaveMessage('');
        setSaveError('');
        setIsConsoleOpen(true);
    }, [activeProfile]);

    const closeConsole = React.useCallback(() => {
        setIsConsoleOpen(false);
        setSaveMessage('');
        setSaveError('');
    }, []);

    const handleFieldChange = React.useCallback((fieldKey, nextValue) => {
        setDraftValues((current) => ({
            ...current,
            [fieldKey]: nextValue
        }));
    }, []);

    const handleSave = React.useCallback(async () => {
        if (!activeProfile) {
            return;
        }

        setIsSaving(true);
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
    }, [activeProfile, draftValues, editableKeys, updateActiveProfile]);

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
                        <p className="footer-info">Edit the active profile values directly.</p>
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
                                        </label>
                                    );
                                }

                                if (fieldKey === 'dentalTier' || fieldKey === 'visionTier') {
                                    return (
                                        <label className="footer-field" key={fieldKey}>
                                            <span>{label}</span>
                                            <select
                                                value={draftValue ?? 'none'}
                                                onChange={(event) => handleFieldChange(fieldKey, event.target.value)}
                                            >
                                                {BENEFIT_TIER_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    );
                                }

                                if (fieldKey === 'homeAddress') {
                                    return (
                                        <label className="footer-field footer-field-wide" key={fieldKey}>
                                            <span>{label}</span>
                                            <textarea
                                                value={draftValue ?? ''}
                                                onChange={(event) => handleFieldChange(fieldKey, event.target.value)}
                                                rows={3}
                                            />
                                        </label>
                                    );
                                }

                                const inputType = fieldKey === 'password'
                                    ? 'password'
                                    : (typeof currentValue === 'number' ? 'number' : 'text');

                                return (
                                    <label className="footer-field" key={fieldKey}>
                                        <span>{label}</span>
                                        <input
                                            type={inputType}
                                            step={typeof currentValue === 'number' ? '0.0001' : undefined}
                                            value={draftValue ?? ''}
                                            onChange={(event) => handleFieldChange(fieldKey, event.target.value)}
                                        />
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
