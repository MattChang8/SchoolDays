import '../components/css/info.css';
import '../components/css/workday.css'
import React from 'react';
import { Conversation } from '../components/cvi/components/conversation';
import { buildApiUrl } from '../components/profiles/api.js';

export function Test() {
  const [conversationUrl, setConversationUrl] = React.useState('');
  const [meetingToken, setMeetingToken] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLeave = () => {
    setConversationUrl('');
    setMeetingToken('');
    setStatusMessage('Conversation ended.');
  };

  const handleStartConversation = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('Creating Tavus conversation...');

    try {
      const response = await fetch(buildApiUrl('/api/tavus/conversation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(payload?.error || 'Failed to create Tavus conversation.');
        setStatusMessage('');
        setIsLoading(false);
        return;
      }

      setConversationUrl(payload.conversationUrl || '');
      setMeetingToken(payload.meetingToken || '');
      setStatusMessage(`Conversation created (${payload.status || 'unknown status'}). Joining room...`);
    } catch (error) {
      setErrorMessage('Could not reach the Tavus conversation service.');
      setStatusMessage('');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
      </style>

      <div
        style={{
          width: '90%',
          height: '90%',
          maxWidth: '1200px',
          margin: '10px auto',
        }}
      >
        {!conversationUrl && (
          <div style={{ marginBottom: '1rem' }}>
            <button type="button" onClick={handleStartConversation} disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Start Tavus Conversation'}
            </button>
          </div>
        )}

        {statusMessage && <p>{statusMessage}</p>}
        {errorMessage && <p style={{ color: '#b00020', fontWeight: 700 }}>{errorMessage}</p>}

        {conversationUrl && (
          <Conversation
            conversationUrl={conversationUrl}
            meetingToken={meetingToken}
            onLeave={handleLeave}
          />
        )}
      </div>
    </>
  )
}
