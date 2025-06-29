
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useCreateTest } from '../hooks/mutations/testMutations';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAuth } from '@clerk/clerk-react';

const testFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(2000),
  subject: z.string().min(1, 'Subject is required'),
  educationLevel: z.string().min(1, 'Education level is required'),
  difficulty: z.enum(['EASY', 'INTERMEDIATE', 'HARD']),
  mcqCount: z.number().min(0).max(20),
  shortAnswerCount: z.number().min(0).max(10),
  isPublic: z.boolean(),
}).refine(data => data.mcqCount > 0 || data.shortAnswerCount > 0, {
  message: 'At least one question type must be selected',
  path: ['mcqCount']
});

function CreateTest() {
    const { getToken } = useAuth();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', prompt: '', subject: '', educationLevel: '', difficulty: '',
    mcqCount: 5, shortAnswerCount: 2, isPublic: false
  });
  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    transcript, listening, resetTranscript,
    browserSupportsSpeechRecognition, startListening, stopListening
  } = useSpeechRecognition();

  const {
    mutate: createTestMutation,
    isPending,
    isError,
    error,
  } = useCreateTest();

  useEffect(() => {
    if (transcript && isRecording) {
      setFormData(prev => ({ ...prev, prompt: prev.prompt + transcript }));
      resetTranscript();
    }
  }, [transcript, isRecording, resetTranscript]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSliderChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const toggleSpeechRecognition = () => {
    if (listening) {
      stopListening();
      setIsRecording(false);
    } else {
      startListening();
      setIsRecording(true);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setIsSubmitting(true);
  try {
    const validatedData = testFormSchema.parse(formData);
    const token = await getToken(); // move after validation, since it's async

    createTestMutation(
      { formData: validatedData, token }, // pass both
      {
        onSuccess: (data) =>{ 
            console.log(data,"data");
            navigate(`/Test/${data.testId}`)},
        onError: () => {
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 3000);
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = {};
      error.errors.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  } finally {
    setIsSubmitting(false);
  }
};

    const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 
    'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Literature'
  ];

  const educationLevels = [
    'ELEMENTARY', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY', 'GRADUATE'
  ];

  const difficulties = [
    { value: 'EASY', label: 'Low' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'HARD', label: 'High' }
  ];

  const getInputClassName = (fieldName) => {
    const baseClassName = "w-full bg-neutral-800 border rounded-xl px-4 py-3 text-white placeholder-neutral-400 focus:outline-none transition-all duration-200";
    if (errors[fieldName]) {
      return `${baseClassName} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`;
    }
    return `${baseClassName} border-neutral-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20`;
  };

  return (
    <div className="min-h-screen bg-neutral-800 pt-8 px-4">
      {showPopup && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg">
          Failed to create test. Please try again.
        </div>
      )}
      {isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-neutral-900 text-white px-8 py-6 rounded-lg shadow-lg flex items-center gap-4">
            <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Generating test, please wait...</span>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
              <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Create New Test ✨
          </h1>
          <p className="text-neutral-300 text-lg">
            Design custom assessments with AI-powered question generation
          </p>
        </div>

        {/* Speech Recognition Status */}
        {!browserSupportsSpeechRecognition && (
          <div className="bg-amber-900/20 border border-amber-500 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Speech recognition is not supported in your browser. You can still type manually.
            </p>
          </div>
        )}

        {/* Form Errors */}
        {errors.submit && (
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Section */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
            <label className="block text-white font-semibold mb-3 text-lg">
              Test Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleInputChange}
              placeholder="Enter a descriptive title for your test..."
              className={getInputClassName('title')}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-2">{errors.title}</p>
            )}
          </div>

          {/* Prompt Section */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-white font-semibold text-lg">
                Test Prompt
              </label>
              {browserSupportsSpeechRecognition && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      listening 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-amber-500 hover:bg-amber-600 text-neutral-900'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    {listening ? 'Stop Recording' : 'Start Recording'}
                  </button>
                  {formData.prompt && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, prompt: '' }))}
                      className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
            <textarea
              name="prompt"
              value={formData.prompt}
              onChange={handleInputChange}
              onBlur={handleInputChange}
              placeholder="Describe what you want your test to cover. Be specific about topics, concepts, and learning objectives..."
              rows={6}
              className={`${getInputClassName('prompt')} resize-vertical`}
            />
            {errors.prompt && (
              <p className="text-red-400 text-sm mt-2">{errors.prompt}</p>
            )}
            {listening && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span>Listening... Speak clearly into your microphone</span>
              </div>
            )}
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Subject */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                onBlur={handleInputChange}
                className={getInputClassName('subject')}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {errors.subject && (
                <p className="text-red-400 text-sm mt-2">{errors.subject}</p>
              )}
            </div>

            {/* Education Level */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Education Level
              </label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleInputChange}
                onBlur={handleInputChange}
                className={getInputClassName('educationLevel')}
              >
                <option value="">Select Level</option>
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {errors.educationLevel && (
                <p className="text-red-400 text-sm mt-2">{errors.educationLevel}</p>
              )}
            </div>

            {/* Difficulty */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                onBlur={handleInputChange}
                className={getInputClassName('difficulty')}
              >
                <option value="">Select Difficulty</option>
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
              {errors.difficulty && (
                <p className="text-red-400 text-sm mt-2">{errors.difficulty}</p>
              )}
            </div>
          </div>

          {/* Question Count Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MCQ Count */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Multiple Choice Questions: {formData.mcqCount}
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={formData.mcqCount}
                onChange={(e) => handleSliderChange('mcqCount', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(formData.mcqCount / 20) * 100}%, #404040 ${(formData.mcqCount / 20) * 100}%, #404040 100%)`
                }}
              />
              <div className="flex justify-between text-neutral-400 text-sm mt-2">
                <span>0</span>
                <span>20</span>
              </div>
              {errors.mcqCount && (
                <p className="text-red-400 text-sm mt-2">{errors.mcqCount}</p>
              )}
            </div>

            {/* Short Answer Count */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Short Answer Questions: {formData.shortAnswerCount}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.shortAnswerCount}
                onChange={(e) => handleSliderChange('shortAnswerCount', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(formData.shortAnswerCount / 10) * 100}%, #404040 ${(formData.shortAnswerCount / 10) * 100}%, #404040 100%)`
                }}
              />
              <div className="flex justify-between text-neutral-400 text-sm mt-2">
                <span>0</span>
                <span>10</span>
              </div>
              {errors.shortAnswerCount && (
                <p className="text-red-400 text-sm mt-2">{errors.shortAnswerCount}</p>
              )}
            </div>
          </div>

          {/* Public/Private Toggle */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="w-5 h-5 text-amber-500 bg-neutral-800 border-neutral-600 rounded focus:ring-amber-500 focus:ring-2"
              />
              <label htmlFor="isPublic" className="text-white font-semibold text-lg">
                Make this test public
              </label>
            </div>
            <p className="text-neutral-400 text-sm mt-2 ml-9">
              Public tests can be discovered and used by other users in the community
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative px-12 py-4 font-bold text-lg rounded-xl transition-all duration-200 shadow-lg transform ${
                isSubmitting
                  ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-900 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/25 hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Test
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              {!isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}

export default CreateTest;
