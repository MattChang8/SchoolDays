import '../components/css/info.css';
import '../components/css/workday.css'
import { Conversation } from '../components/cvi/components/conversation';

export function Test() {

  const handleLeave = () => {
    //handle leave
  }
  
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
        <Conversation
          conversationUrl='https://tavus.daily.co/c244ad817c3c041a'
          onLeave={handleLeave}
        />
      </div>
    </>
  )
}
