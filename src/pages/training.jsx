import React from 'react';
import '../components/css/workday.css';
import '../components/css/training.css';
import { useProfile } from '../components/profiles/profileContext.jsx';

const TRAINING_MODULES = [
  {
    key: 'warehouseTraining',
    title: 'Warehouse Safety Basics',
    description: 'Safe movement, lifting, and workspace awareness in the warehouse.',
    videoEmbedUrl: 'https://www.youtube.com/embed/xm4gR1u2o-Q?si=CehMr2DpWQDqR3fq&amp;',
    questions: [
      {
        prompt: 'What is the safest first step before lifting a box?',
        options: ['Twist and lift quickly', 'Test the weight and use proper form', 'Lift with your back'],
        correctIndex: 1
      },
      {
        prompt: 'Why should aisles remain clear?',
        options: ['For decoration', 'To prevent slips, trips, and blocked exits', 'To make walking longer'],
        correctIndex: 1
      },
      {
        prompt: 'If something spills, what should you do?',
        options: ['Ignore it', 'Report and clean it promptly', 'Walk around it all day'],
        correctIndex: 1
      }
    ]
  },
  {
    key: 'ladderTraining',
    title: 'Ladder Safety',
    description: 'Proper ladder setup, climbing posture, and fall prevention.',
    videoEmbedUrl: 'https://www.youtube.com/embed/XbEL_447oHg?si=6D0UnD6tT8KOKucx&amp',
    questions: [
      {
        prompt: 'How should a ladder be placed?',
        options: ['On stable, level ground', 'On a box for extra height', 'Against loose materials'],
        correctIndex: 0
      },
      {
        prompt: 'How many points of contact should you keep while climbing?',
        options: ['One', 'Two', 'Three'],
        correctIndex: 2
      },
      {
        prompt: 'What should you do if the ladder is damaged?',
        options: ['Use it carefully', 'Tag it out and report it', 'Hide it'],
        correctIndex: 1
      }
    ]
  },
  {
    key: 'knifeSafetyTraining',
    title: 'Knife Safety',
    description: 'Cutting technique, blade handling, and safe storage.',
    videoEmbedUrl: 'https://www.youtube.com/embed/K3sPaIeGNnQ?si=dYdgGbL-QK8gMf9h&amp;',
    questions: [
      {
        prompt: 'What direction should you cut?',
        options: ['Toward your body', 'Away from your body', 'Any direction'],
        correctIndex: 1
      },
      {
        prompt: 'What should you do when carrying a knife?',
        options: ['Point it forward', 'Hold blade exposed above shoulder', 'Keep blade pointed down and controlled'],
        correctIndex: 2
      },
      {
        prompt: 'When finished, where should the knife go?',
        options: ['In a designated safe storage spot', 'On a random table edge', 'In your pocket'],
        correctIndex: 0
      }
    ]
  }
];

function getRequiredModules(profile) {
  return TRAINING_MODULES.filter((module) => Boolean(profile?.[module.key]));
}

function getFinishedModules(profile) {
  return TRAINING_MODULES.filter((module) => profile && profile[module.key] === false);
}

export function Training() {
  const { activeProfile, updateActiveProfile } = useProfile();
  const requiredModules = getRequiredModules(activeProfile);
  const finishedModules = getFinishedModules(activeProfile);

  const [activeModuleKey, setActiveModuleKey] = React.useState(null);
  const [isReviewOnly, setIsReviewOnly] = React.useState(false);
  const [step, setStep] = React.useState('list');
  const [answers, setAnswers] = React.useState({});
  const [resultMessage, setResultMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const activeModule = TRAINING_MODULES.find((module) => module.key === activeModuleKey) || null;

  const beginModule = (moduleKey, reviewOnly = false) => {
    setActiveModuleKey(moduleKey);
    setIsReviewOnly(reviewOnly);
    setStep('video');
    setAnswers({});
    setResultMessage('');
    setErrorMessage('');
  };

  const goToQuiz = () => {
    setStep('quiz');
    setResultMessage('');
    setErrorMessage('');
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers((current) => ({
      ...current,
      [questionIndex]: optionIndex
    }));
  };

  const gradeQuiz = async () => {
    if (!activeModule) {
      return;
    }

    const allAnswered = activeModule.questions.every((_, questionIndex) => answers[questionIndex] !== undefined);
    if (!allAnswered) {
      setErrorMessage('Please answer all 3 questions before submitting.');
      return;
    }

    const passed = activeModule.questions.every(
      (question, questionIndex) => Number(answers[questionIndex]) === question.correctIndex
    );

    if (!passed) {
      setResultMessage('You did not pass this attempt. Watch the video again and retry.');
      setErrorMessage('');
      setStep('result-fail');
      return;
    }

    setIsSaving(true);
    const updateResult = await updateActiveProfile({
      updates: { [activeModule.key]: false },
      currentPassword: activeProfile?.password || ''
    });
    setIsSaving(false);

    if (!updateResult.ok) {
      setErrorMessage(updateResult.error || 'Could not update training completion status.');
      return;
    }

    setResultMessage(`Congrats! You passed ${activeModule.title}. Training is now complete.`);
    setErrorMessage('');
    setStep('result-pass');
  };

  const returnToModuleList = () => {
    setStep('list');
    setActiveModuleKey(null);
    setIsReviewOnly(false);
    setAnswers({});
    setResultMessage('');
    setErrorMessage('');
  };

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`}
      </style>

      <div className="trainingPage">
        <div className="largeTitle">
          <h>Training</h>
        </div>

        {step === 'list' && (
          <>
            <section className="trainingPanel">
              <h2 className="mediumHeading">Required Modules</h2>
              {requiredModules.length === 0 && (
                <p className="bodyTextMedium">No required training modules right now.</p>
              )}
              {requiredModules.length > 0 && (
                <div className="trainingCards">
                  {requiredModules.map((module) => (
                    <button key={module.key} className="trainingCard" onClick={() => beginModule(module.key)} type="button">
                      <h3>{module.title}</h3>
                      <p>{module.description}</p>
                      <span>Open Module</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="trainingPanel">
              <h2 className="mediumHeading">Finished Modules</h2>
              {finishedModules.length === 0 && (
                <p className="bodyTextMedium">No finished modules yet.</p>
              )}
              {finishedModules.length > 0 && (
                <div className="trainingCards">
                  {finishedModules.map((module) => (
                    <button
                      key={module.key}
                      className="trainingCard trainingCardComplete"
                      onClick={() => beginModule(module.key, true)}
                      type="button"
                    >
                      <h3>{module.title}</h3>
                      <p>{module.description}</p>
                      <span>Rewatch Video</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeModule && step === 'video' && (
          <section className="trainingPanel">
            <h2 className="mediumHeading">{activeModule.title}</h2>
            <p className="bodyTextMedium">
              {isReviewOnly
                ? 'This module is already complete. You can rewatch the video, but the quiz is locked.'
                : 'Watch the video, then click Next to start the quiz.'}
            </p>
            <div className="trainingVideoWrap">
              <iframe
                src={activeModule.videoEmbedUrl}
                title={activeModule.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="trainingActions">
              <button type="button" onClick={returnToModuleList}>Back to Modules</button>
              {!isReviewOnly && <button type="button" onClick={goToQuiz}>Next</button>}
            </div>
          </section>
        )}

        {activeModule && step === 'quiz' && (
          <section className="trainingPanel">
            <h2 className="mediumHeading">{activeModule.title} Quiz</h2>
            <p className="bodyTextMedium">All 3 questions must be correct to pass.</p>
            <div className="trainingQuiz">
              {activeModule.questions.map((question, questionIndex) => (
                <fieldset className="trainingQuestion" key={`${activeModule.key}-q-${questionIndex}`}>
                  <legend>{questionIndex + 1}. {question.prompt}</legend>
                  {question.options.map((option, optionIndex) => (
                    <label key={`${activeModule.key}-q-${questionIndex}-o-${optionIndex}`}>
                      <input
                        type="radio"
                        name={`${activeModule.key}-question-${questionIndex}`}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                      />
                      {option}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>

            {errorMessage && <p className="trainingError">{errorMessage}</p>}

            <div className="trainingActions">
              <button type="button" onClick={() => setStep('video')}>Back to Video</button>
              <button type="button" onClick={gradeQuiz} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Submit Quiz'}
              </button>
            </div>
          </section>
        )}

        {activeModule && step === 'result-pass' && (
          <section className="trainingPanel">
            <h2 className="mediumHeading">Training Complete</h2>
            <p className="trainingSuccess">{resultMessage}</p>
            <div className="trainingActions">
              <button type="button" onClick={returnToModuleList}>Return to Modules</button>
            </div>
          </section>
        )}

        {activeModule && step === 'result-fail' && (
          <section className="trainingPanel">
            <h2 className="mediumHeading">Retry Required</h2>
            <p className="trainingError">{resultMessage}</p>
            <div className="trainingActions">
              <button type="button" onClick={() => setStep('video')}>Watch Video Again</button>
              <button type="button" onClick={() => setStep('quiz')}>Retry Quiz</button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
