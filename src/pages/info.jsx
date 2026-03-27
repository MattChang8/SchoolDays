import '../components/css/info.css';
import '../components/css/workday.css'
import React from 'react';
import { useProfile } from '../components/profiles/profileContext.jsx';
import maleProfileImage from '../components/images/img_male.png';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9()+\-\s]{7,20}$/;
const DOB_PATTERN = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;

function validatePersonalInfo(editValues) {
    const nextErrors = {};

    if (!String(editValues.firstName || '').trim()) {
        nextErrors.firstName = 'First name is required.';
    }

    if (!String(editValues.lastName || '').trim()) {
        nextErrors.lastName = 'Last name is required.';
    }

    if (!String(editValues.dob || '').trim()) {
        nextErrors.dob = 'Date of birth is required.';
    } else if (!DOB_PATTERN.test(String(editValues.dob).trim())) {
        nextErrors.dob = 'Use MM/DD/YYYY format.';
    }

    if (!String(editValues.homePhone || '').trim()) {
        nextErrors.homePhone = 'Home phone is required.';
    } else if (!PHONE_PATTERN.test(String(editValues.homePhone).trim())) {
        nextErrors.homePhone = 'Enter a valid phone number.';
    }

    if (!String(editValues.cellPhone || '').trim()) {
        nextErrors.cellPhone = 'Cell phone is required.';
    } else if (!PHONE_PATTERN.test(String(editValues.cellPhone).trim())) {
        nextErrors.cellPhone = 'Enter a valid phone number.';
    }

    if (!String(editValues.homeAddress || '').trim()) {
        nextErrors.homeAddress = 'Home address is required.';
    }

    if (!String(editValues.emergencyContactName || '').trim()) {
        nextErrors.emergencyContactName = 'Emergency contact name is required.';
    }

    if (!String(editValues.emergencyContactNumber || '').trim()) {
        nextErrors.emergencyContactNumber = 'Emergency contact number is required.';
    } else if (!PHONE_PATTERN.test(String(editValues.emergencyContactNumber).trim())) {
        nextErrors.emergencyContactNumber = 'Enter a valid phone number.';
    }

    if (!String(editValues.personalEmail || '').trim()) {
        nextErrors.personalEmail = 'Personal email is required.';
    } else if (!EMAIL_PATTERN.test(String(editValues.personalEmail).trim())) {
        nextErrors.personalEmail = 'Enter a valid personal email.';
    }

    return nextErrors;
}

export function Info(){
    const { activeProfile, updateActiveProfile } = useProfile();
    const [isInfoOpen, setIsInfoOpen] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValues, setEditValues] = React.useState({});
    const [confirmedPassword, setConfirmedPassword] = React.useState('');
    const [editError, setEditError] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({});

    const displayName = activeProfile
        ? [activeProfile.firstName, activeProfile.lastName].filter(Boolean).join(' ')
        : 'Default';

    const openInfo = () => {
        setIsInfoOpen(true);
        setIsEditing(false);
        setEditError('');
        setValidationErrors({});
        setEditValues({
            firstName: activeProfile?.firstName || '',
            lastName: activeProfile?.lastName || '',
            title: activeProfile?.title || '',
            email: activeProfile?.email || '',
            dob: activeProfile?.dob || '',
            homePhone: activeProfile?.homePhone || '',
            cellPhone: activeProfile?.cellPhone || '',
            homeAddress: activeProfile?.homeAddress || '',
            emergencyContactName: activeProfile?.emergencyContactName || '',
            emergencyContactNumber: activeProfile?.emergencyContactNumber || '',
            personalEmail: activeProfile?.personalEmail || '',
            password: activeProfile?.password || ''
        });
    };

    const closeInfo = () => {
        setIsInfoOpen(false);
        setIsEditing(false);
        setConfirmedPassword('');
        setEditError('');
        setValidationErrors({});
    };

    const handleStartEdit = () => {
        const enteredPassword = window.prompt('Enter your current password to edit profile info:');
        if (enteredPassword === null) {
            return;
        }

        if (enteredPassword !== (activeProfile?.password || '')) {
            setEditError('Incorrect password. Please contact IT to reset your password.');
            return;
        }

        setConfirmedPassword(enteredPassword);
        setEditError('');
        setValidationErrors({});
        setIsEditing(true);
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setEditValues((current) => ({
            ...current,
            [name]: value
        }));
        setValidationErrors((current) => {
            if (!current[name]) {
                return current;
            }

            const nextErrors = { ...current };
            delete nextErrors[name];
            return nextErrors;
        });
    };

    const handleSave = async () => {
        const nextValidationErrors = validatePersonalInfo(editValues);
        if (Object.keys(nextValidationErrors).length > 0) {
            setValidationErrors(nextValidationErrors);
            setEditError('Resolve the validation errors before saving.');
            return;
        }

        setIsSaving(true);
        setValidationErrors({});
        setEditError('');
        const result = await updateActiveProfile({
            updates: editValues,
            currentPassword: confirmedPassword
        });
        setIsSaving(false);

        if (!result.ok) {
            setEditError(result.error);
            return;
        }

        setEditError('');
        setValidationErrors({});
        setIsEditing(false);
        setConfirmedPassword('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setValidationErrors({});
        setEditError('');
    };

    return (
    <>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
        </style>

        <div className='paddingLeft'>
            <div className='largeTitle'>
                <h>Personal Information</h>
            </div>
            

            <div className='bodyTextMedium'>
                <img className='profilePic' src={maleProfileImage} alt='profile'/>
                <h className='mediumHeading'> {displayName}</h>
                <p>Title: {activeProfile?.title || 'Guest'}</p>
                <p>Email: {activeProfile?.email || 'default@schooldays.com'}</p>
                <button onClick={openInfo}>View Info</button>
            </div>

            {isInfoOpen && (
                <div className='profileInfoBox'>
                    <h className='mediumHeading'>Profile Details</h>

                    {editError && <p className='errorText'>{editError}</p>}

                    {!isEditing && (
                        <>
                            <p><strong>Name:</strong> {[activeProfile?.firstName, activeProfile?.lastName].filter(Boolean).join(' ')}</p>
                            <p><strong>Job Title:</strong> {activeProfile?.title}</p>
                            <p><strong>Work Email:</strong> {activeProfile?.email}</p>
                            <p><strong>Date of Birth:</strong> {activeProfile?.dob}</p>
                            <p><strong>Home Phone:</strong> {activeProfile?.homePhone}</p>
                            <p><strong>Cell Phone:</strong> {activeProfile?.cellPhone}</p>
                            <p><strong>Home Address:</strong> {activeProfile?.homeAddress}</p>
                            <p><strong>Emergency Contact:</strong> {activeProfile?.emergencyContactName}</p>
                            <p><strong>Emergency Number:</strong> {activeProfile?.emergencyContactNumber}</p>
                            <p><strong>Personal Email:</strong> {activeProfile?.personalEmail}</p>
                        </>
                    )}

                    {isEditing && (
                        <div className='editForm'>
                            <label>First Name <input name='firstName' value={editValues.firstName || ''} onChange={handleFieldChange} />{validationErrors.firstName && <span className='infoFieldError'>{validationErrors.firstName}</span>}</label>
                            <label>Last Name <input name='lastName' value={editValues.lastName || ''} onChange={handleFieldChange} />{validationErrors.lastName && <span className='infoFieldError'>{validationErrors.lastName}</span>}</label>
                            <label>Title <input disabled={true} name='title' value={editValues.title || ''} onChange={handleFieldChange} /></label>
                            <label>Work Email <input disabled={true} name='email' value={editValues.email || ''} onChange={handleFieldChange} /></label>
                            <label>Date of Birth <input name='dob' placeholder='MM/DD/YYYY' value={editValues.dob || ''} onChange={handleFieldChange} />{validationErrors.dob && <span className='infoFieldError'>{validationErrors.dob}</span>}</label>
                            <label>Home Phone <input name='homePhone' value={editValues.homePhone || ''} onChange={handleFieldChange} />{validationErrors.homePhone && <span className='infoFieldError'>{validationErrors.homePhone}</span>}</label>
                            <label>Cell Phone <input name='cellPhone' value={editValues.cellPhone || ''} onChange={handleFieldChange} />{validationErrors.cellPhone && <span className='infoFieldError'>{validationErrors.cellPhone}</span>}</label>
                            <label>Home Address <input name='homeAddress' value={editValues.homeAddress || ''} onChange={handleFieldChange} />{validationErrors.homeAddress && <span className='infoFieldError'>{validationErrors.homeAddress}</span>}</label>
                            <label>Emergency Contact <input name='emergencyContactName' value={editValues.emergencyContactName || ''} onChange={handleFieldChange} />{validationErrors.emergencyContactName && <span className='infoFieldError'>{validationErrors.emergencyContactName}</span>}</label>
                            <label>Emergency Number <input name='emergencyContactNumber' value={editValues.emergencyContactNumber || ''} onChange={handleFieldChange} />{validationErrors.emergencyContactNumber && <span className='infoFieldError'>{validationErrors.emergencyContactNumber}</span>}</label>
                            <label>Personal Email <input type='email' name='personalEmail' value={editValues.personalEmail || ''} onChange={handleFieldChange} />{validationErrors.personalEmail && <span className='infoFieldError'>{validationErrors.personalEmail}</span>}</label>
                        </div>
                    )}

                    <div className='profileInfoActions'>
                        {!isEditing && <button onClick={handleStartEdit}>Edit Info</button>}
                        {isEditing && <button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>}
                        {isEditing && <button onClick={handleCancelEdit}>Cancel</button>}
                        <button onClick={closeInfo}>Close</button>
                    </div>
                </div>
            )}
        </div>
      </>
    )

}
