import '../components/css/info.css';
import '../components/css/workday.css'
import React from 'react';
import { useProfile } from '../components/profiles/profileContext.jsx';
import maleProfileImage from '../components/images/img_male.png';


export function Info(){
    const { activeProfile, updateActiveProfile } = useProfile();
    const [isInfoOpen, setIsInfoOpen] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValues, setEditValues] = React.useState({});
    const [confirmedPassword, setConfirmedPassword] = React.useState('');
    const [editError, setEditError] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    const displayName = activeProfile
        ? [activeProfile.firstName, activeProfile.lastName].filter(Boolean).join(' ')
        : 'Default';

    const openInfo = () => {
        setIsInfoOpen(true);
        setIsEditing(false);
        setEditError('');
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
        setIsEditing(true);
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setEditValues((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
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
        setIsEditing(false);
        setConfirmedPassword('');
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
                            <label>First Name <input name='firstName' value={editValues.firstName || ''} onChange={handleFieldChange} /></label>
                            <label>Last Name <input name='lastName' value={editValues.lastName || ''} onChange={handleFieldChange} /></label>
                            <label>Title <input disabled='true' name='title' value={editValues.title || ''} onChange={handleFieldChange} /></label>
                            <label>Work Email <input disabled='true' name='email' value={editValues.email || ''} onChange={handleFieldChange} /></label>
                            <label>Date of Birth <input name='dob' value={editValues.dob || ''} onChange={handleFieldChange} /></label>
                            <label>Home Phone <input name='homePhone' value={editValues.homePhone || ''} onChange={handleFieldChange} /></label>
                            <label>Cell Phone <input name='cellPhone' value={editValues.cellPhone || ''} onChange={handleFieldChange} /></label>
                            <label>Home Address <input name='homeAddress' value={editValues.homeAddress || ''} onChange={handleFieldChange} /></label>
                            <label>Emergency Contact <input name='emergencyContactName' value={editValues.emergencyContactName || ''} onChange={handleFieldChange} /></label>
                            <label>Emergency Number <input name='emergencyContactNumber' value={editValues.emergencyContactNumber || ''} onChange={handleFieldChange} /></label>
                            <label>Personal Email <input name='personalEmail' value={editValues.personalEmail || ''} onChange={handleFieldChange} /></label>
                        </div>
                    )}

                    <div className='profileInfoActions'>
                        {!isEditing && <button onClick={handleStartEdit}>Edit Info</button>}
                        {isEditing && <button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>}
                        {isEditing && <button onClick={() => setIsEditing(false)}>Cancel</button>}
                        <button onClick={closeInfo}>Close</button>
                    </div>
                </div>
            )}
        </div>
      </>
    )

}
