import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            JOIN TestGenerator
          </h1>
          <p className="text-black text-lg">
            Create your account and start building amazing tests
          </p>
        </div>

        {/* Sign Up Form Container */}
        <div className="px-8">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent p-0",
                headerTitle: "text-2xl font-semibold text-gray-800 text-center mb-2",
                headerSubtitle: "text-gray-600 text-center mb-6",
                socialButtonsBlockButton: "w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 mb-3",
                socialButtonsBlockButtonText: "font-medium",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500 text-sm",
                formButtonPrimary: "w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105",
                formFieldInput: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200",
                formFieldLabel: "text-gray-700 font-medium mb-2 block",
                footerActionLink: "text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200",
                identityPreviewText: "text-gray-600",
                identityPreviewEditButton: "text-purple-600 hover:text-purple-700",
                formHeaderTitle: "text-xl font-semibold text-gray-800 mb-4",
                otpCodeFieldInput: "w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                formResendCodeLink: "text-purple-600 hover:text-purple-700 font-medium"
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false
              },
              variables: {
                colorPrimary: "#8b5cf6",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#374151",
                borderRadius: "0.5rem"
              }
            }}
            fallbackRedirectUrl="/Dashboard"
            signInUrl="/sign-in"
            routing="path"
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-purple-100">
            Already have an account?{' '}
            <a 
              href="/sign-in" 
              className="text-white font-semibold hover:text-purple-200 transition-colors duration-200 underline"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};


export default SignUpPage;