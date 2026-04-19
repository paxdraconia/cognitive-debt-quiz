import { AnimatePresence, motion } from 'framer-motion';
import { useQuiz } from './hooks/useQuiz';
import StickerBackground from './components/StickerBackground';
import ProgressBar from './components/ProgressBar';
import Question from './components/Question';
import Nudge from './components/Nudge';
import Results from './components/Results';
import AdminDashboard from './components/AdminDashboard';

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

const nudgeVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const fadeVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function IntroScreen({ onStart }) {
  return (
    <motion.div
      className="intro"
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="intro-content">
        <h1 className="intro-brand">Nerd Out</h1>
        <h2 className="intro-title">Cognitive Debt</h2>
        <p className="intro-subtitle">
          Your organization is probably carrying more than you think.
          <br />
          15 questions. 5 dimensions. Let's find out where.
        </p>
        <button className="intro-button" onClick={onStart}>
          Let's go
        </button>
      </div>
    </motion.div>
  );
}

export default function App() {
  const quiz = useQuiz();

  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="app">
      <StickerBackground />

      {quiz.phase !== 'intro' && quiz.phase !== 'results' && (
        <ProgressBar
          progress={quiz.progress}
          total={quiz.totalQuestions}
        />
      )}

      <main className="main">
        <div className="card-container">
          <AnimatePresence mode="wait">
            {quiz.phase === 'intro' && (
              <IntroScreen key="intro" onStart={quiz.startQuiz} />
            )}

            {quiz.phase === 'question' && quiz.currentQuestion && (
              <motion.div
                key={`q-${quiz.currentQuestion.id}`}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Question
                  question={quiz.currentQuestion}
                  onAnswer={quiz.answerQuestion}
                  onNext={quiz.nextQuestion}
                />
              </motion.div>
            )}

            {quiz.phase === 'nudge' && quiz.currentNudge && (
              <motion.div
                key={`nudge-${quiz.currentNudge.dimension}`}
                variants={nudgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Nudge
                  nudge={quiz.currentNudge}
                  onContinue={quiz.advanceFromNudge}
                />
              </motion.div>
            )}

            {quiz.phase === 'results' && quiz.scores && (
              <motion.div
                key="results"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Results
                  scores={quiz.scores}
                  profile={quiz.profile}
                  resources={quiz.resources}
                  resourcesUnlocked={quiz.resourcesUnlocked}
                  onUnlockResources={quiz.unlockResources}
                  onRestart={quiz.restart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
