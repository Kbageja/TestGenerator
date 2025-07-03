import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, User, Loader2, AlertTriangle } from 'lucide-react';
import { useResultById } from '../hooks/query/testQueries'; // Adjust import path as needed
import { useAuth } from '@clerk/clerk-react';
import { useParams } from 'react-router-dom';

const TestResult = () => {
 const { id } = useParams();
const { getToken } = useAuth();


  const [token, setToken] = useState(null);

    useEffect(() => {
      const fetchToken = async () => {
        const t = await getToken();
        setToken(t);
      };
      fetchToken();
    }, [getToken]);
  // Fetch result data using your custom hook
  const { data: resultData, isLoading, isError, error } = useResultById(id, token);
  console.log(resultData);

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-emerald-900/30 border-emerald-700';
    if (percentage >= 60) return 'bg-amber-900/30 border-amber-700';
    return 'bg-red-900/30 border-red-700';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGradeText = (percentage) => {
    if (percentage >= 90) return 'Outstanding';
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Needs Improvement';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Your Results...</h2>
          <p className="text-neutral-400">Please wait while we fetch your test results</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-neutral-800 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Results</h2>
          <p className="text-neutral-400 mb-4">
            {error?.message || 'An error occurred while fetching your test results'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!resultData) {
    return (
      <div className="min-h-screen bg-neutral-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-amber-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">No Results Found</h2>
          <p className="text-neutral-400">The requested test result could not be found</p>
        </div>
      </div>
    );
  }

  const feedback = resultData.feedback || [];
  const answers = resultData.answers || [];
  const questions = resultData.questions||[];
  
  // Calculate score as sum of marksAwarded from feedback
  const calculatedScore = feedback.reduce((sum, item) => {
    return sum + (item.marksAwarded || 0);
  }, 0);
  
  const percentage = calculatedScore && resultData.totalMarks ? Math.round((calculatedScore / resultData.totalMarks) * 100) : 0;
  
  console.log(resultData);

  return (
    <div className="min-h-screen bg-neutral-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-neutral-700 rounded-lg p-6 mb-6 border border-neutral-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Test Results</h1>
              <p className="text-neutral-300">{resultData.testTitle}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-neutral-300 mb-2">
                <Clock size={20} />
                <span className="text-sm">
                  Submitted: {new Date(resultData.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-neutral-400 text-sm">
                Time Taken: {formatTime(resultData.timeTaken)}
              </div>
            </div>
          </div>
          
          {/* Score Display */}
          <div className={`rounded-lg p-6 border-2 ${getScoreBgColor(calculatedScore, resultData.totalMarks)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-200 mb-2">Your Score</h2>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-4xl font-bold ${getScoreColor(calculatedScore, resultData.totalMarks)}`}>
                    {calculatedScore}
                  </span>
                  <span className="text-2xl text-neutral-400">/ {resultData.totalMarks}</span>
                  <span className={`text-xl font-semibold ${getScoreColor(calculatedScore, resultData.totalMarks)}`}>
                    ({percentage}%)
                  </span>
                </div>
              </div>
              <div className="text-right">
                {resultData.isCompleted ? (
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle size={24} />
                    <span className="font-medium">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertCircle size={24} />
                    <span className="font-medium">In Progress</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-neutral-700 rounded-lg p-4 mb-6 border border-neutral-600">
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-300 font-medium">Overall Performance</span>
            <span className="text-neutral-300 text-sm">{percentage}%</span>
          </div>
          <div className="w-full bg-neutral-600 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                percentage >= 80 ? 'bg-emerald-500' : 
                percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Overall Feedback */}
        {resultData.overallFeedback && (
          <div className="bg-neutral-700 rounded-lg p-6 mb-6 border border-neutral-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <User size={20} className="text-amber-400" />
              <span>Overall Feedback</span>
            </h3>
            <div className="bg-neutral-600 rounded-lg p-4 border border-neutral-500">
              <p className="text-neutral-300 leading-relaxed">{resultData.overallFeedback}</p>
            </div>
          </div>
        )}

        {/* Detailed Feedback Section */}
        {feedback.length > 0 && (
          <div className="bg-neutral-700 rounded-lg p-6 mb-6 border border-neutral-600">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <User size={24} className="text-amber-400" />
              <span>Detailed Feedback</span>
            </h3>
            
            <div className="space-y-4">
              {feedback.map((feedbackItem, index) => (
                <div key={index} className="bg-neutral-600 rounded-lg p-4 border border-neutral-500">
                  <div className="flex items-start space-x-3">
                    <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-200 mb-2">Question {index + 1}</h4>
                      {questions[index] && (
                        <div className="bg-neutral-800 rounded p-3 mb-3 border border-neutral-700">
                          <p className="text-neutral-300 text-sm italic">
                            {questions[index].question}
                          </p>
                        </div>
                      )}
                      <p className="text-neutral-300 leading-relaxed">
                         <p ><span className='font-medium text-amber-400'>Marks Awarded: </span>{feedbackItem.marksAwarded}</p>
                        <p ><span className='font-medium text-amber-400'>Feedback: </span>{feedbackItem.feedback}</p>
                        <p> <span className='font-medium text-amber-400'>Your Answer: </span> {feedbackItem.userAnswer}</p>
                        <p> <span className='font-medium text-amber-400'>Correct Answer: </span> {feedbackItem.correctAnswer}</p>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600 text-center">
            <div className="text-2xl font-bold text-amber-400">{resultData.answeredQuestions}</div>
            <div className="text-neutral-300 text-sm">Questions Answered</div>
          </div>
          <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600 text-center">
            <div className="text-2xl font-bold text-blue-400">{resultData.totalQuestions}</div>
            <div className="text-neutral-300 text-sm">Total Questions</div>
          </div>
          <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600 text-center">
            <div className="text-2xl font-bold text-amber-400">{percentage}%</div>
            <div className="text-neutral-300 text-sm">Success Rate</div>
          </div>
          <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600 text-center">
            <div className={`text-2xl font-bold ${getScoreColor(calculatedScore, resultData.totalMarks)}`}>
              {getGradeText(percentage)}
            </div>
            <div className="text-neutral-300 text-sm">Overall Grade</div>
          </div>
        </div>

        {/* Test Info */}
<div className="mt-6 bg-neutral-800/50 backdrop-blur-sm rounded-xl p-5 border border-neutral-700/60 shadow-lg">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-8 text-sm">
    <div className="flex flex-col space-y-1 bg-neutral-700/30 rounded-lg p-3 border border-neutral-600/50">
      <span className="font-medium text-amber-400/80 text-xs uppercase tracking-wider">Created</span>
      <span className="text-neutral-300 font-mono">
        {new Date(resultData.createdAt).toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
    </div>
    <div className="flex flex-col space-y-1 bg-neutral-700/30 rounded-lg p-3 border border-neutral-600/50">
      <span className="font-medium text-amber-400/80 text-xs uppercase tracking-wider">Last Updated</span>
      <span className="text-neutral-300 font-mono">
        {new Date(resultData.updatedAt).toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
        {resultData.createdAt === resultData.updatedAt && (
          <span className="ml-2 text-xs text-amber-500/70">(never modified)</span>
        )}
      </span>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default TestResult;