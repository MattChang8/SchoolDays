import '../components/css/benefits.css';
import React from 'react';
import { useProfile } from '../components/profiles/profileContext.jsx';

const BENEFIT_TIERS = [
    { value: 'none', label: 'None', percent: 0 },
    { value: 'silver', label: 'Silver', percent: 0.02 },
    { value: 'gold', label: 'Gold', percent: 0.035 },
    { value: 'platinum', label: 'Platinum', percent: 0.05 }
];

export function Benefits(){
    const { activeProfile, updateActiveProfile } = useProfile();
    const displayCredit = activeProfile
    ? [activeProfile.storeCredit].filter(Boolean).join(' ')
    : 'Default';
    const [isSaving, setIsSaving] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState('');
    const [statusError, setStatusError] = React.useState('');

    const dentalTier = activeProfile?.dentalTier || 'none';
    const visionTier = activeProfile?.visionTier || 'none';

    const handleTierChange = async (fieldName, value) => {
        setIsSaving(true);
        setStatusMessage('');
        setStatusError('');

        const result = await updateActiveProfile({
            updates: { [fieldName]: value },
            currentPassword: activeProfile?.password || ''
        });

        setIsSaving(false);

        if (!result.ok) {
            setStatusError(result.error || 'Unable to update benefit selection.');
            return;
        }

        setStatusMessage('Benefits updated.');
    };


    return (
        <>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
        </style>

        <div className='paddingLeft'>
            {/* Benefits Title */}
            <div className='largeTitle'>
                <h>Benefits</h>
            </div>

            <div>
                <h className='largeHeading'>School Benefits</h>
                <br/>
                <div className='cardRow'>
                    <div className="benefitCard">
                        <h4>Student Store Credit</h4>
                        <p>${displayCredit}</p>
                    </div>
                    <div className='benefitCard'>
                        <h4>Student Software</h4>
                        <a className='studentSoftwareLink' href='https://www.avid.com/' target='_blank' rel='noreferrer' >AVID Pro Tools &#129109;</a><br/>
                        <a className='studentSoftwareLink' href='https://myapps.microsoft.com/' target='_blank' rel='noreferrer' >Microsoft 365 &#129109;</a><br/>
                        <a className='studentSoftwareLink' href='https://www.adobe.com/creativecloud/buy/students.html' target='_blank' rel='noreferrer' >Adobe &#129109;</a>
                    </div>
                    <div className='benefitCard benefitCardWide'>
                        <h4>Dental & Vision Elections</h4>
                        <div className='benefitTierRow'>
                            <label>
                                Dental Tier
                                <select
                                    value={dentalTier}
                                    onChange={(event) => handleTierChange('dentalTier', event.target.value)}
                                    disabled={isSaving}
                                >
                                    {BENEFIT_TIERS.map((tier) => (
                                        <option key={tier.value} value={tier.value}>
                                            {tier.label} ({(tier.percent * 100).toFixed(1)}%)
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Vision Tier
                                <select
                                    value={visionTier}
                                    onChange={(event) => handleTierChange('visionTier', event.target.value)}
                                    disabled={isSaving}
                                >
                                    {BENEFIT_TIERS.map((tier) => (
                                        <option key={tier.value} value={tier.value}>
                                            {tier.label} ({(tier.percent * 100).toFixed(1)}%)
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <p className='benefitTierNote'>
                            Benefit tier percentages are applied to net pay and reflected on the Payroll page.
                        </p>
                        {statusMessage && <p className='benefitStatus'>{statusMessage}</p>}
                        {statusError && <p className='benefitError'>{statusError}</p>}
                    </div>
                </div>
            </div>


            <div className=''>
                <h className='mediumHeading'>Counseling</h>
            </div>
                <div className="benefitCard">
                    <h4>Schedule an Appointment</h4>
                    <a className='studentSoftwareLink' href='https://www.yestotherapy.com/' target='_blank' rel='noreferrer' >YesToTherapy &#129109;</a><br/>
                </div>
            </div>
        </>
    )

}
