import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome to TestGenerator
          </h1>
          <p className="text-black text-lg">
            Sign in to continue creating and managing your tests
          </p>
        </div>

        {/* Sign In Form Container */}
        <div className="md:px-8 ">
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/Dashboard"
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
                formButtonPrimary: "w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105",
                formFieldInput: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
                formFieldLabel: "text-gray-700 font-medium mb-2 block",
                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200",
                identityPreviewText: "text-gray-600",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                formHeaderTitle: "text-xl font-semibold text-gray-800 mb-4",
                otpCodeFieldInput: "w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                formResendCodeLink: "text-blue-600 hover:text-blue-700 font-medium"
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false
              },
              variables: {
                colorPrimary: "#3b82f6",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#374151",
                borderRadius: "0.5rem"
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-100">
            Don't have an account?{' '}
            <a 
              href="/sign-up" 
              className="text-white font-semibold hover:text-blue-200 transition-colors duration-200 underline"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;