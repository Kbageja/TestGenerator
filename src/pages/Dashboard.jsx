import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import API from '../services/api';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStats } from '../hooks/query/testQueries';

export default function Dashboard() {
   const { userId } = useAuth();
    const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  
    const [token, setToken] = useState(null);
  
    useEffect(() => {
      const fetchToken = async () => {
        const t = await getToken();
        setToken(t);
      };
      fetchToken();
    }, [getToken]);
  
   const { data: statsTest = {} } = useStats(token);
    console.log(statsTest, "myTest");

  const [stats, setStats] = useState({
    totalTests: 12,
    totalAttempts: 84,
    averageScore: 87,
    recentActivity: 5
  });



  return (
    <div className="min-h-screen bg-neutral-800 pt-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-neutral-300 text-lg">
                Here's what's happening with your tests today
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl p-4">
                <div className="text-amber-400 text-3xl mb-2">🏆</div>
                <p className="text-amber-300 font-semibold">Top Performer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Total Tests</p>
                <p className="text-3xl font-bold text-white mt-1">{statsTest.totalTests ?? 'No data'}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm font-medium">+{statsTest.testsThisWeek ?? 'No data'} this week</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Total Attempts</p>
                <p className="text-3xl font-bold text-white mt-1">{statsTest.totalAttempts ?? 'No data'}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm font-medium">+{statsTest.attemptsThisWeek ?? 'No data'} this week</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-white mt-1">{statsTest.averageScoreThisMonth ?? '0'}%</p>
              </div>
              <div className="bg-amber-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm font-medium">This Month</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Recent Activity</p>
                <p className="text-3xl font-bold text-white mt-1">{statsTest.recentActivity ?? 'No data'}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-neutral-400 text-sm font-medium">Last 24 hours</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions Card */}
<div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
      <div className="space-y-4">
        <button
          onClick={() => navigate("/CreateTest")}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-900 font-semibold py-3 px-4 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25"
        >
          Create New Test
        </button>
        <button
          onClick={() => navigate("/Tests")}
          className="w-full bg-neutral-800 border border-neutral-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-neutral-700 hover:border-neutral-500 transition-all duration-200"
        >
          View All Tests
        </button>
        <button
          onClick={() => console.log('Export clicked')}
          className="w-full bg-neutral-800 border border-neutral-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-neutral-700 hover:border-neutral-500 transition-all duration-200"
        >
          Export Results
        </button>
      </div>
    </div>

         
         {/* Recent Tests */}
<div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
  <h2 className="text-2xl font-bold text-white mb-6">Recent Tests</h2>
<div className="space-y-4">
  {statsTest.recentTests?.length > 0 ? (
    statsTest.recentTests.map((test, index) => (
      <div
        key={index}
        className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">{test.testTitle}</h3>
            <p className="text-neutral-400 text-sm">
              {test.totalMarks > 0
                ? `${((test.score * 100) / test.totalMarks).toFixed(2)}% Score`
                : "N/A"}{" "}
              • {new Date(test.submittedAt).toLocaleString()}
            </p>
          </div>
          <button className="text-amber-400 hover:text-amber-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="text-neutral-400">No recent tests available</p>
  )}
</div>

</div>

        </div>

        {/* Bottom Spacer */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}