import { useReducer, useCallback, useEffect, useRef } from 'react';
import questionsData from '../data/questions.json';
import nudgesData from '../data/nudges.json';
import { computeScores, matchProfile, getResourcesForProfile } from '../utils/scoring';
import { submitQuiz } from '../lib/submitQuiz';

const initialState = {
  phase: 'intro',       // intro | question | nudge | results
  currentQuestionIndex: 0,
  answers: {},           // { questionId: { score } }
  scores: null,
  profile: null,
  resources: null,
  resourcesUnlocked: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ':
      return { ...state, phase: 'question', currentQuestionIndex: 0 };

    case 'ANSWER_QUESTION': {
      const { questionId, score } = action.payload;
      return {
        ...state,
        answers: { ...state.answers, [questionId]: { score } },
      };
    }

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentQuestionIndex + 1;
      const currentQuestion = questionsData.questions[state.currentQuestionIndex];
      const isLastInCluster = currentQuestion.questionIndex === 2;

      if (isLastInCluster) {
        return { ...state, phase: 'nudge' };
      }

      if (nextIndex >= questionsData.questions.length) {
        return { ...state, phase: 'results' };
      }

      return { ...state, currentQuestionIndex: nextIndex };
    }

    case 'ADVANCE_FROM_NUDGE': {
      const nextIndex = state.currentQuestionIndex + 1;

      if (nextIndex >= questionsData.questions.length) {
        const scores = computeScores(state.answers);
        const profile = matchProfile(scores);
        const resources = getResourcesForProfile(scores);
        return {
          ...state,
          phase: 'results',
          scores,
          profile,
          resources,
        };
      }

      return { ...state, phase: 'question', currentQuestionIndex: nextIndex };
    }

    case 'UNLOCK_RESOURCES':
      return { ...state, resourcesUnlocked: true };

    case 'RESTART':
      return { ...initialState };

    default:
      return state;
  }
}

export function useQuiz() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (state.phase === 'results' && state.scores && !submittedRef.current) {
      submittedRef.current = true;
      submitQuiz(state.answers, state.scores, state.profile);
    }
    if (state.phase === 'intro') {
      submittedRef.current = false;
    }
  }, [state.phase, state.scores, state.answers, state.profile]);

  const startQuiz = useCallback(() => dispatch({ type: 'START_QUIZ' }), []);

  const answerQuestion = useCallback((questionId, score) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, score } });
  }, []);

  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), []);

  const advanceFromNudge = useCallback(() => dispatch({ type: 'ADVANCE_FROM_NUDGE' }), []);

  const unlockResources = useCallback(() => dispatch({ type: 'UNLOCK_RESOURCES' }), []);

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  const currentQuestion = questionsData.questions[state.currentQuestionIndex] || null;

  const currentNudge = currentQuestion
    ? nudgesData.nudges.find(n => n.afterCluster === currentQuestion.clusterIndex)
    : null;

  const progress = state.currentQuestionIndex / questionsData.questions.length;

  return {
    ...state,
    currentQuestion,
    currentNudge,
    progress,
    totalQuestions: questionsData.questions.length,
    startQuiz,
    answerQuestion,
    nextQuestion,
    advanceFromNudge,
    unlockResources,
    restart,
  };
}
