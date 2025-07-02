import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full py-4 px-4">
      <nav className="max-w-2xl mx-auto bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-4xl px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="text-amber-400 font-bold text-lg hover:text-amber-300 transition-colors duration-200"
          >
            Test Maker
          </Link>
          
          {/* Desktop Navigation - shown on md screens and larger */}
          <div className="hidden md:flex items-center space-x-6">
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

          {/* Mobile menu button - shown on small screens */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-300 hover:text-amber-400 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - shown when menu is open */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-4">
            <SignedIn>
              <Link 
                to="/Dashboard" 
                className="block text-neutral-300 hover:text-white transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <Link 
                to="/CreateTest" 
                className="block text-neutral-300 hover:text-white transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create
              </Link>

              <Link 
                to="/Tests" 
                className="block text-neutral-300 hover:text-white transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tests
              </Link>
              
              <div className="flex items-center py-2 px-3">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full ring-2 ring-amber-400/30 hover:ring-amber-400/50 transition-all duration-200"
                    }
                  }}
                />
                <span className="ml-3 text-neutral-300">Account</span>
              </div>
            </SignedIn>
            
            <SignedOut>
              <Link 
                to="/sign-in"
                className="block bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-900 px-4 py-2 rounded-full font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-md hover:shadow-amber-500/25 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </SignedOut>
          </div>
        )}
      </nav>
    </div>
  );
}