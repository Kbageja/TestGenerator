// 📄 TestRunner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTestById } from '../hooks/query/testQueries';
import { useEvaluation } from '../hooks/mutations/testMutations'; // Import your evaluation hook
import { useAuth } from '@clerk/clerk-react';

function TestRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken,isLoaded } = useAuth();
  const [testStarted, setTestStarted] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const startTimeRef = useRef(null);
  const testIdRef = useRef(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
  if (!isLoaded) return;

  const fetchData = async () => {
    const token = await getToken();
    console.log("Token:", token);
    // Fetch with token
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
      // Setup questions
      const allQuestions = [
        ...(test.questions.mcqs || []).map(q => ({ ...q, type: 'mcq' })),
        ...(test.questions.shortAnswers || []).map(q => ({ ...q, type: 'short' })),
      ];
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setRandomizedQuestions(shuffled);
      const newTestId = `test_${test.id}_${Date.now()}`;
      testIdRef.current = newTestId;
      
      // Save initial test data
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

    // Calculate time limit: 2 minutes per question or test.timeLimit
    const fallbackTimeLimit = randomizedQuestions.length * 2; // 2 min per question
    const effectiveTimeLimit = test?.timeLimit || fallbackTimeLimit;
    const totalTestTime = effectiveTimeLimit * 60 * 1000; // Convert to milliseconds

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, Math.floor((totalTestTime - elapsed) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        handleTestComplete();
        return false; // Stop the timer
      }
      return true; // Continue the timer
    };

    // Initial timer update
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

const handleTestComplete = async () => {
  const token2  = await getToken();
  setIsEvaluating(true);
  
  const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
  const totalMarks = randomizedQuestions.length * 5;
  
  // Create ordered question-answer pairs
  const questionsWithAnswers = randomizedQuestions.map((question, index) => ({
    questionNumber: index + 1,
    question: question.question,
    type: question.type,
    options: question.type === 'mcq' ? question.options : null,
    correctAnswer: question.correctAnswer || null,
    userAnswer: answers[index] || null,
    isAnswered: answers[index] !== undefined && answers[index] !== ''
  }));

  const testAttempt = {
    testId: test.id,
    testTitle: test.title,
    questions: questionsWithAnswers,
    answers,
    timeTaken,
    isCompleted: true,
    totalMarks,
    totalQuestions: randomizedQuestions.length,
    answeredQuestions: Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length
  };
  
  try {
    // Make sure token is available
    if (!token2) {
      throw new Error('Authentication token not available');
    }

    // Call the evaluation mutation with the correct parameter structure
evalTestMutation(
      { formData: testAttempt, token:token2 }, // pass both
      {
        onSuccess: (data) =>{ 
            console.log(data,"data");
            navigate(`/Test/Result/${data.id}`)},
        onError: () => {
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 3000);
        },
      }
    );
    
    // Clean up localStorage on successful evaluation
    localStorage.removeItem(`startTime_${test.id}`);
    localStorage.removeItem(`testData_${test.id}`);

  } catch (error) {
    console.error('Error during test evaluation:', error);
    setIsEvaluating(false);
    
    // Show user-friendly error message
    if (error.message.includes('token') || error.message.includes('401')) {
      alert('Authentication error. Please refresh the page and try again.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      alert('Network error. Please check your connection and try again.');
    } else {
      alert('Failed to submit test. Please try again or contact support.');
    }
  }
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