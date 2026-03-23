import '../components/css/login.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../components/profiles/profileContext.jsx';



export function Login(){

    const { profiles, setActiveProfileId, defaultProfileId, refreshProfiles } = useProfile();
    const navigate = useNavigate();
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [statusMessage, setStatusMessage] = React.useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatusMessage('');

        const latestProfiles = await refreshProfiles();
        const profileSource = latestProfiles || profiles || {};

        const inputUsername = username.trim();
        const inputPassword = password;

        const matchedEntry = Object.entries(profileSource).find(([, profile]) => {
            if (!profile) {
                return false;
            }

            const storedUsername = (profile.username || '').trim();
            const storedPassword = profile.password || '';
            return storedUsername !== '' && storedUsername === inputUsername && storedPassword === inputPassword;
        });

        if (!matchedEntry) {
            setActiveProfileId(defaultProfileId);
            setStatusMessage('Invalid username or password.');
            return;
        }

        const [matchedId, matchedProfile] = matchedEntry;
        setActiveProfileId(matchedProfile.id || matchedId);
        navigate('/dashboard');
    };
    
    return(
        <>
            <div className='loginLogo'>
                <img src={require('../components/images/SchoolDayLogo.png')} alt="placeholder"/>
            </div>
            <form className='textfield' onSubmit={handleSubmit}>
                <label>
                    Username: <input name="username" value={username} onChange={(event) => setUsername(event.target.value)} />
                </label>
                <br />
                <label>
                    Password: <input type='password' name="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <br /><br />
                <button type="submit">Submit</button>
                {statusMessage && <p>{statusMessage}</p>}
            </form>
            <br />
            <div className='tooltip'>
                <span className='forgot'>Forgot Password?</span>
                <span class='tooltiptext'>Either navigate to a page or put 'guest1' in both fields</span>
            </div>

        </>
    );
}
