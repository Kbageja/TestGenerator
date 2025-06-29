import {
  SignInButton,
  SignOutButton,
  useUser,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();

  return (
    <div className="min-h-screen bg-neutral-850 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Test Generator
              </span>{" "}
              🎯
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
          </div>

          <SignedIn>
            <div className="text-center space-y-6">
              {/* Welcome Message */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                <p className="text-2xl text-white mb-2">
                  Hello,{" "}
                  <span className="font-semibold text-amber-400">
                    {isLoaded && user?.fullName ? user.fullName : "User"}
                  </span>{" "}
                  👋
                </p>
                <p className="text-neutral-300 text-lg">
                  You're signed in and ready to create amazing tests!
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-4 my-8">
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="text-amber-400 text-2xl mb-2">📝</div>
                  <h3 className="text-white font-semibold mb-1">Create Tests</h3>
                  <p className="text-neutral-400 text-sm">Build custom assessments</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="text-amber-400 text-2xl mb-2">📊</div>
                  <h3 className="text-white font-semibold mb-1">View Results</h3>
                  <p className="text-neutral-400 text-sm">Track performance</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="text-amber-400 text-2xl mb-2">🎯</div>
                  <h3 className="text-white font-semibold mb-1">Analyze</h3>
                  <p className="text-neutral-400 text-sm">Get insights</p>
                </div>
              </div>

              {/* Sign Out Button */}
              <SignOutButton>
                <button className="group relative px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105">
                  <span className="relative z-10">Sign Out</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </SignOutButton>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="text-center space-y-6">
              {/* Welcome Message for Signed Out */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Ready to Get Started?
                </h2>
                <p className="text-neutral-300 text-lg mb-6">
                  Sign in to unlock powerful test creation tools and analytics
                </p>
                
                {/* Features Preview */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm border border-amber-500/30">
                    Custom Tests
                  </span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm border border-amber-500/30">
                    Real-time Analytics
                  </span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm border border-amber-500/30">
                    Progress Tracking
                  </span>
                </div>
              </div>

              {/* Sign In Button */}
              <Link to='/sign-in' >
                <button className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-900 font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-lg hover:shadow-amber-500/25 transform hover:scale-105">
                  <span className="relative z-10 flex items-center gap-2">
                    Sign In to Continue
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </Link>

              <p className="text-neutral-500 text-sm">
                New here? Sign up is quick and easy!
              </p>
            </div>
          </SignedOut>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-sm">
            Powered by modern web technologies
          </p>
        </div>
      </div>
    </div>
  );
}