// 📄 TestRunner.jsx - Enhanced with Security Features
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTestById } from '../hooks/query/testQueries';
import { useEvaluation } from '../hooks/mutations/testMutations';
import { useAuth } from '@clerk/clerk-react';

function TestRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken, isLoaded } = useAuth();
  const [testStarted, setTestStarted] = useState(false); // Changed to false initially
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [securityViolations, setSecurityViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(true);
  
  const startTimeRef = useRef(null);
  const testIdRef = useRef(null);
  const answersRef = useRef({});
  const [token, setToken] = useState(null);
  const autoSubmittedRef = useRef(false); // Prevent multiple auto-submits


  // Keep answersRef in sync with answers state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchData = async () => {
      const token = await getToken();
      console.log("Token:", token);
      setToken(token);
    };

    fetchData();
  }, [isLoaded]);

  const { data: test, isLoading } = useGetTestById(id, token);
  const {
    mutate: evalTestMutation,
    isPending,
    isError,
    error,
  } = useEvaluation();

  // Security: Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (testStarted && !isCurrentlyFullscreen && !isEvaluating) {
        handleSecurityViolation('Exited fullscreen mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [testStarted, isEvaluating]);

  // Security: Tab visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (testStarted && document.hidden && !isEvaluating) {
        handleSecurityViolation('Switched to another tab/window');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testStarted, isEvaluating]);

  // Security: Prevent back navigation
  useEffect(() => {
    if (!testStarted) return;

    const handlePopState = (event) => {
      event.preventDefault();
      handleSecurityViolation('Attempted to navigate back');
      // Push the current state back
      window.history.pushState(null, '', window.location.pathname);
    };

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
      return event.returnValue;
    };

    // Push initial state
    window.history.pushState(null, '', window.location.pathname);
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testStarted]);

  // Security: Context menu and keyboard shortcuts
  useEffect(() => {
    if (!testStarted) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleSecurityViolation('Attempted to open context menu');
    };

    const handleKeyDown = (e) => {
      // Prevent common shortcuts that could be used to cheat
      if (
        e.key === 'F12' || // Developer tools
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Developer tools
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Inspector
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Console
        (e.ctrlKey && e.key === 'u') || // View source
        (e.ctrlKey && e.key === 'U') || // View source
        (e.ctrlKey && e.key === 's') || // Save page
        (e.ctrlKey && e.key === 'S') || // Save page
        (e.ctrlKey && e.key === 'a') || // Select all
        (e.ctrlKey && e.key === 'A') || // Select all
        (e.ctrlKey && e.key === 'p') || // Print
        (e.ctrlKey && e.key === 'P') || // Print
        (e.altKey && e.key === 'Tab') || // Alt+Tab
        e.key === 'F5' || // Refresh
        (e.ctrlKey && e.key === 'r') || // Refresh
        (e.ctrlKey && e.key === 'R') // Refresh
      ) {
        e.preventDefault();
        handleSecurityViolation(`Attempted to use prohibited shortcut: ${e.key}`);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [testStarted]);

const handleSecurityViolation = (violation) => {
  setSecurityViolations((prev) => {
    const updatedCount = prev + 1;
    console.warn(`Security violation ${updatedCount}: ${violation}`);

    if (updatedCount >= 2 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true; // Prevent multiple auto-submits
      alert('Multiple security violations detected. Test will be automatically submitted.');
      handleTestCompleteWithCurrentAnswers();
    } else {
      setShowViolationWarning(true);
      setTimeout(() => setShowViolationWarning(false), 5000);
    }

    return updatedCount;
  });
};



  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      return true;
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      return false;
    }
  };

  const startSecureTest = async () => {
    const fullscreenSuccess = await enterFullscreen();
    if (fullscreenSuccess) {
      setTestStarted(true);
      setShowSecurityPrompt(false);
    } else {
      alert('Fullscreen mode is required to start the test. Please allow fullscreen access.');
    }
  };

  // Initialize test data and load saved data
  useEffect(() => {
    if (!test) return;
    
    const testDataKey = `testData_${test.id}`;
    const savedTestData = localStorage.getItem(testDataKey);
    
    if (savedTestData) {
      try {
        const { randomizedQuestions: savedQuestions, answers: savedAnswers, testId } = JSON.parse(savedTestData);
        setRandomizedQuestions(savedQuestions);
        setAnswers(savedAnswers || {});
        testIdRef.current = testId;
      } catch (error) {
        console.error('Error parsing saved test data:', error);
        initializeNewTest();
      }
    } else {
      initializeNewTest();
    }

    function initializeNewTest() {
      const allQuestions = [
        ...(test.questions.mcqs || []).map(q => ({ ...q, type: 'mcq' })),
        ...(test.questions.shortAnswers || []).map(q => ({ ...q, type: 'short' })),
      ];
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setRandomizedQuestions(shuffled);
      const newTestId = `test_${test.id}_${Date.now()}`;
      testIdRef.current = newTestId;
      
      const testData = {
        randomizedQuestions: shuffled,
        answers: {},
        testId: newTestId
      };
      localStorage.setItem(testDataKey, JSON.stringify(testData));
    }
  }, [test]);

  // Save test data whenever answers or questions change
  useEffect(() => {
    if (!test?.id || randomizedQuestions.length === 0) return;
    
    const testData = {
      randomizedQuestions,
      answers,
      testId: testIdRef.current
    };
    localStorage.setItem(`testData_${test.id}`, JSON.stringify(testData));
  }, [answers, randomizedQuestions, test?.id]);

  // Timer logic
  useEffect(() => {
    if (!testStarted || randomizedQuestions.length === 0 || !testIdRef.current || isEvaluating) return;

    const testId = testIdRef.current;
    const startTimeKey = `startTime_${test.id}`;
    let startTime = localStorage.getItem(startTimeKey);
    
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(startTimeKey, startTime.toString());
    } else {
      startTime = parseInt(startTime);
    }
    startTimeRef.current = startTime;

    const fallbackTimeLimit = randomizedQuestions.length * 2;
    const effectiveTimeLimit = test?.timeLimit || fallbackTimeLimit;
    const totalTestTime = effectiveTimeLimit * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, Math.floor((totalTestTime - elapsed) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        handleTestCompleteWithCurrentAnswers();
        return false;
      }
      return true;
    };

    if (!updateTimer()) return;

    const timer = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, randomizedQuestions, test, testIdRef.current, isEvaluating]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleTestCompleteWithCurrentAnswers = async () => {
    const token2 = await getToken();
    setIsEvaluating(true);
    
    const currentAnswers = answersRef.current;
    const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    const totalMarks = randomizedQuestions.length * 5;
    
    const questionsWithAnswers = randomizedQuestions.map((question, index) => ({
      questionNumber: index + 1,
      question: question.question,
      type: question.type,
      options: question.type === 'mcq' ? question.options : null,
      correctAnswer: question.correctAnswer || null,
      userAnswer: currentAnswers[index] || null,
      isAnswered: currentAnswers[index] !== undefined && currentAnswers[index] !== ''
    }));

    let answeredQuestionsCount = 0;
    for (let i = 0; i < randomizedQuestions.length; i++) {
      const answer = currentAnswers[i];
      if (answer !== undefined && answer !== null && answer !== '') {
        answeredQuestionsCount++;
      }
    }

    const testAttempt = {
      testId: test.id,
      testTitle: test.title,
      questions: questionsWithAnswers,
      answers: currentAnswers,
      timeTaken,
      isCompleted: true,
      totalMarks,
      totalQuestions: randomizedQuestions.length,
      answeredQuestions: answeredQuestionsCount,
      securityViolations: securityViolations // Include security violations
    };
    
    try {
      if (!token2) {
        throw new Error('Authentication token not available');
      }

      evalTestMutation(
        { formData: testAttempt, token: token2 },
        {
          onSuccess: (data) => { 
            console.log(data, "data");
            // Exit fullscreen before navigation
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
            navigate(`/Test/Result/${data.id}`);
          },
          onError: () => {
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
          },
        }
      );
      
      localStorage.removeItem(`startTime_${test.id}`);
      localStorage.removeItem(`testData_${test.id}`);

    } catch (error) {
      console.error('Error during test evaluation:', error);
      setIsEvaluating(false);
      
      if (error.message.includes('token') || error.message.includes('401')) {
        alert('Authentication error. Please refresh the page and try again.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Failed to submit test. Please try again or contact support.');
      }
    }
  };

  const handleTestComplete = async () => {
    await handleTestCompleteWithCurrentAnswers();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionBlockClass = (index) => {
    const isAnswered = answers[index] !== undefined && answers[index] !== '';
    const isCurrent = index === currentQuestion;
    const base = "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm cursor-pointer transition-all duration-200 border-2";
    if (isCurrent) return `${base} bg-amber-500 text-black border-amber-400`;
    if (isAnswered) return `${base} bg-neutral-800 text-amber-100 border-amber-500 hover:border-amber-400`;
    return `${base} bg-neutral-700 text-neutral-300 border-neutral-600 hover:border-amber-600 hover:text-amber-200`;
  };

  // Show security prompt before test starts
  if (showSecurityPrompt && !testStarted) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-neutral-800 rounded-lg border border-neutral-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-2V9m0 0V7m0 2h2m-2 0H10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Secure Test Environment</h2>
            <p className="text-neutral-300 mb-6 leading-relaxed">
              This test requires a secure environment to ensure fairness. Please note the following restrictions:
            </p>
            <div className="text-left space-y-3 mb-8">
              <div className="flex items-center text-neutral-300">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>You must remain in fullscreen mode throughout the test</span>
              </div>
              <div className="flex items-center text-neutral-300">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Switching tabs or windows is not allowed</span>
              </div>
              <div className="flex items-center text-neutral-300">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Right-click and keyboard shortcuts are disabled</span>
              </div>
              <div className="flex items-center text-neutral-300">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>Navigation back/forward is prevented</span>
              </div>
              <div className="flex items-center text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                <span>3 security violations will automatically submit your test</span>
              </div>
            </div>
            <button
              onClick={startSecureTest}
              className="px-8 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-all duration-200 font-medium text-lg"
            >
              Start Secure Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show evaluation loader
  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-amber-400 text-xl font-medium">Evaluating your test...</p>
          <p className="text-neutral-400 text-sm mt-2">Please wait while we process your answers</p>
        </div>
      </div>
    );
  }

  if (isLoading || !test || randomizedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <p className="text-neutral-400 text-lg">Loading Test...</p>
      </div>
    );
  }

  const currentQuestionData = randomizedQuestions[currentQuestion];
  const totalQuestions = randomizedQuestions.length;
  const mcqCount = test.mcqCount || 0;
  const shortAnswerCount = test.shortAnswerCount || 0;

  return (
    <div className="min-h-screen bg-neutral-900 text-amber-100">
      {/* Security Violation Warning */}
      {showViolationWarning && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg border border-red-500 animate-pulse">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="font-medium">Security Violation Detected!</p>
              <p className="text-sm">Violations: {securityViolations}/3</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">{test.title}</h1>
            <p className="text-neutral-400">
              MCQ: {mcqCount} | Short Answer: {shortAnswerCount} | 5 marks each
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono">
              <span className="text-neutral-400">Time: </span>
              <span className={timeRemaining !== null && timeRemaining < 300 ? 'text-red-400' : 'text-amber-400'}>
                {timeRemaining !== null ? formatTime(timeRemaining) : 'Loading...'}
              </span>
            </div>
            <div className="text-sm text-neutral-400">
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            {securityViolations > 0 && (
              <div className="text-sm text-red-400">
                Security Violations: {securityViolations}/3
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - 4x4 Grid */}
        <div className="w-48 bg-neutral-800 border-r border-neutral-700 p-4">
          <div className="sticky top-4">
            <h3 className="text-amber-400 font-medium mb-3 text-center">Questions</h3>
            <div className="grid grid-cols-4 gap-2">
              {randomizedQuestions.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={getQuestionBlockClass(index)}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Question */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-amber-400">
                    Question {currentQuestion + 1}
                  </h2>
                  <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                    currentQuestionData.type === 'mcq' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {currentQuestionData.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                  </span>
                </div>
                <div className="bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  5 marks
                </div>
              </div>
              <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <p className="text-lg text-neutral-200 leading-relaxed">
                  {currentQuestionData.question}
                </p>
              </div>
            </div>

            {/* Answer Area */}
            <div className="mb-8">
              {currentQuestionData.type === 'mcq' ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <label className="block text-amber-400 font-medium mb-3">
                    Select your answer:
                  </label>
                  {currentQuestionData.options?.map((option, index) => (
                    <div
                      key={index}
                      className={`bg-neutral-800 rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 ${
                        answers[currentQuestion] === option
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-neutral-700 hover:border-amber-600'
                      }`}
                      onClick={() => handleAnswerChange(currentQuestion, option)}
                    >
                      <div className="flex items-start">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 mt-1 flex-shrink-0 ${
                          answers[currentQuestion] === option
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-neutral-500'
                        }`}>
                          {answers[currentQuestion] === option && (
                            <div className="w-2 h-2 bg-black rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span className="text-neutral-200 break-words">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-amber-400 font-medium mb-3">
                    Your Answer:
                  </label>
                  <div className="bg-neutral-800 rounded-lg border border-neutral-700 focus-within:border-amber-500">
                    <textarea
                      className="w-full h-48 p-6 bg-transparent text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none"
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                className="px-6 py-3 bg-neutral-700 text-neutral-300 rounded-lg border border-neutral-600 hover:border-amber-600 hover:text-amber-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              <div className="flex space-x-4">
                {currentQuestion === totalQuestions - 1 ? (
                  <button
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleTestComplete}
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? 'Submitting...' : 'Submit Test'}
                  </button>
                ) : (
                  <button
                    className="px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-all duration-200 font-medium"
                    onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestRunner;