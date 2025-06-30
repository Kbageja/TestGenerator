import React, { useEffect, useState } from "react";
import {
  Clock,
  Users,
  BookOpen,
  Trophy,
  Star,
  Search,
  Globe,
  Lock,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import {
  useMyTest,
  usePublicTest,
  useAttempted,
} from "../hooks/query/testQueries";
import { useNavigate } from "react-router-dom";

function Tests() {
  const { userId, getToken } = useAuth();
  const [token, setToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      const t = await getToken();
      setToken(t);
    };
    fetchToken();
  }, [getToken]);

  const { data: myTests = [] } = useMyTest(userId, token);
  const { data: publicTests = [] } = usePublicTest(userId, token);
  const { data: attemptedTests = [] } = useAttempted(userId, token);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-400 ";
      case "MEDIUM":
        return "text-amber-400 ";
      case "HARD":
        return "text-red-400 ";
      default:
        return "text-gray-400 bg-gray-900/20";
    }
  };

  const formatTime = (seconds) => `${Math.round(seconds / 60)}m`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  // 🔥 Exclude attempted public tests
  const filteredPublicTests = publicTests
    .filter((test) => {
      const isAttempted = attemptedTests.some(
        (attempt) => attempt.testId === test.id
      );
      return !isAttempted;
    })
    .filter(
      (test) =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.creator?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-neutral-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-amber-400 mb-2">Tests</h1>
          <p className="text-neutral-400">Manage and take your tests</p>
        </div>

        {/* My Tests */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-amber-400" size={24} />
            <h2 className="text-2xl font-semibold">My Tests</h2>
            <span className="bg-amber-900/20 text-amber-400 px-2 py-1 rounded-full text-sm">
              {myTests.length}
            </span>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            {myTests.map((test) => {
              const matchingAttempt = attemptedTests.find(
                (attempt) =>
                  attempt.testId === test.id &&
                  attempt.user?.clerkId === userId
              );
              return (
                <div
                  key={test.id}
                  className="min-w-80 w-80 bg-neutral-900 rounded-lg p-6 border border-neutral-700 hover:border-amber-400/50"
                >
                  <div className="flex justify-between mb-4">
                    <div className="flex-1 mr-2 overflow-hidden">
                      <h3 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis hover:whitespace-normal hover:overflow-visible hover:text-ellipsis-none transition-all duration-300 ease-in-out hover:animate-pulse">
                        {test.title}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                        test.difficulty
                      )}`}
                    >
                      {test.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} /> {test.subject}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} /> {test.mcqCount} MCQ,{" "}
                      {test.shortAnswerCount} SA
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} /> {test.attemptsCount ?? 0} attempts
                    </div>
                    <div className="flex items-center gap-2">
                      {test.isPublic ? (
                        <>
                          <Globe size={16} />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-xs text-neutral-500">
                    <span>Created {formatDate(test.createdAt)}</span>
                    <button
                      disabled={!matchingAttempt}
                      onClick={() =>
                        matchingAttempt &&
                        navigate(`/Test/Result/${matchingAttempt.id}`)
                      }
                      className={`px-4 py-1 rounded-md text-sm ${
                        matchingAttempt
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                      }`}
                    >
                      {matchingAttempt ? "View" : "Not Attempted"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-amber-400 italic">Scroll to view</p>
        </section>

        {/* Attempted Tests */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-amber-400" size={24} />
            <h2 className="text-2xl font-semibold">Attempted Tests</h2>
            <span className="bg-amber-900/20 text-amber-400 px-2 py-1 rounded-full text-sm">
              {attemptedTests.length}
            </span>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            {attemptedTests.map((attempt) => (
              <div
                key={attempt.id}
                className=" min-w-80 w-80 bg-neutral-900 rounded-lg p-6 border border-neutral-700 hover:border-amber-400/50"
              >
                <div className="flex justify-between mb-4">
                  <div className="flex-1 mr-2 overflow-hidden">
                    <h3 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis hover:whitespace-normal hover:overflow-visible hover:text-ellipsis-none transition-all duration-300 ease-in-out hover:animate-pulse">
                      {attempt.testTitle}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-neutral-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock size={16} /> {formatTime(attempt.timeTaken)}
                  </div>
                  {attempt.isCompleted ? (
                    <div className="flex items-center gap-2">
                      <Star
                        size={16}
                        className={`font-semibold ${getScoreColor(
                          (attempt.score * 100) / attempt.totalMarks
                        )}`}
                      />
                      <span
                        className={`font-semibold ${getScoreColor(
                          (attempt.score * 100) / attempt.totalMarks
                        )}`}
                      >
                        {Math.round(
                          (attempt.score * 100) / attempt.totalMarks
                        )}
                        %
                      </span>
                      <span className="text-neutral-400">
                        ({attempt.score}/{attempt.totalMarks})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-400">
                      <Clock size={16} /> In Progress
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-neutral-500">
                  <span>{formatDate(attempt.createdAt)}</span>
                  <button
                    onClick={() =>
                      attempt.isCompleted
                        ? navigate(`/Test/Result/${attempt.id}`)
                        : navigate(`/Test/${attempt.testId}`)
                    }
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1 rounded-md text-sm"
                  >
                    {attempt.isCompleted ? "Review" : "Continue"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-amber-400 italic">Scroll to view</p>
        </section>

        {/* Public Tests */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-amber-400" size={24} />
            <h2 className="text-2xl font-semibold">Online Tests</h2>
            <span className="bg-amber-900/20 text-amber-400 px-2 py-1 rounded-full text-sm">
              {filteredPublicTests.length}
            </span>
          </div>
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search tests by title, subject, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublicTests.map((test) => (
              <div
                key={test.id}
                className="bg-neutral-900 rounded-lg p-6 border border-neutral-700 hover:border-amber-400/50"
              >
                <div className="flex justify-between mb-4">
                  <div className="flex-1 mr-2 overflow-hidden">
                    <h3 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis hover:whitespace-normal hover:overflow-visible hover:text-ellipsis-none transition-all duration-300 ease-in-out hover:animate-pulse">
                      {test.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                      test.difficulty
                    )}`}
                  >
                    {test.difficulty}
                  </span>
                </div>
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                  {test.prompt}
                </p>
                <div className="text-sm text-neutral-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} /> {test.subject}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} /> {test.mcqCount} MCQ,{" "}
                    {test.shortAnswerCount} SA
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} /> {test.attemptsCount ?? 0} attempts
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-neutral-500">
                  <span>By {test.creatorName ?? "Unknown"}</span>
                  <span>{formatDate(test.createdAt)}</span>
                </div>
                <button
                  onClick={() => navigate(`/Test/${test.id}`)}
                  className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md text-sm"
                >
                  Start Test
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Tests;
