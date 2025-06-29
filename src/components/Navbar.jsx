import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="w-full py-4 px-4">
      <nav className="max-w-2xl mx-auto bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-4xl px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="text-amber-400 font-bold text-lg hover:text-amber-300 transition-colors duration-200"
          >
            Test Generator
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
           
            
            <SignedIn>
              <Link 
                to="/Dashboard" 
                className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Dashboard
              </Link>

               <Link 
              to="/CreateTest" 
              className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Create
            </Link>

            <Link 
              to="/Tests" 
              className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Tests
            </Link>

              
              {/* User Button with custom styling */}
              <div className="flex items-center">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full ring-2 ring-amber-400/30 hover:ring-amber-400/50 transition-all duration-200"
                    }
                  }}
                />
              </div>
            </SignedIn>
            
            <SignedOut>
              <Link 
                to="/sign-in"
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-900 px-4 py-2 rounded-full font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-md hover:shadow-amber-500/25 transform hover:scale-105"
              >
                Sign In
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>
    </div>
  );
}