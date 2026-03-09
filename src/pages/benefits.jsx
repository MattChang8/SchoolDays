import '../components/css/benefits.css';
import { useProfile } from '../components/profiles/profileContext.jsx';

export function Benefits(){
    const { activeProfile } = useProfile();
    const displayCredit = activeProfile
    ? [activeProfile.storeCredit].filter(Boolean).join(' ')
    : 'Default';


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