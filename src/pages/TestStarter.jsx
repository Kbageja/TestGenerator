import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTestById } from '../hooks/query/testQueries';
import { useAuth } from '@clerk/clerk-react';

function TestStarter() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const t = await getToken();
      setToken(t);
    };
    fetchToken();
  }, [getToken]);

  const { data: test, isLoading } = useGetTestById(id, token);

  if (isLoading || !test) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 text-lg">Loading test details...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = test.mcqCount+test.shortAnswerCount;

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-700 text-center">
          <h1 className="text-3xl font-bold text-amber-500 mb-4">{test.title}</h1>
          <p className="text-neutral-300 text-lg mb-6">{test.description}</p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-600">
              <div className="text-2xl font-bold text-amber-400">{totalQuestions}</div>
              <div className="text-neutral-400">Total Questions</div>
            </div>
            <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-600">
              <div className="text-2xl font-bold text-amber-400">{totalQuestions * 5}</div>
              <div className="text-neutral-400">Total Marks</div>
            </div>
            <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-600">
              <div className="text-2xl font-bold text-amber-400">{test.mcqCount}</div>
              <div className="text-neutral-400">MCQ Questions</div>
            </div>
            <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-600">
              <div className="text-2xl font-bold text-amber-400">{test.shortAnswerCount}</div>
              <div className="text-neutral-400">Short Answer</div>
            </div>
          </div>

          {test.timeLimit && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-amber-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="font-semibold">Time Limit: {test.timeLimit} minutes</span>
              </div>
            </div>
          )}

          <div className="text-neutral-400 text-sm mb-8">
            <p>• Each question carries 5 marks</p>
            <p>• Questions will be presented in random order</p>
            <p>• You can navigate between questions freely</p>
            <p>• Timer will persist even if you refresh the page</p>
          </div>

          <button
            onClick={() => navigate(`/test/${id}/start`)}
            className="px-8 py-4 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all duration-200 text-lg"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestStarter;
