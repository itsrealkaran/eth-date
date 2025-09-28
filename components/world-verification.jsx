import { useState } from 'react';
import { useWorldVerification } from '@/hooks/use-world-verification';

export default function WorldVerification({ 
  onVerificationSuccess, 
  onVerificationError,
  action = 'rizzler-verification',
  signal = null,
  verificationLevel = null,
  className = '',
  children
}) {
  const { 
    verifyUser, 
    isVerifying, 
    verificationError, 
    isVerified, 
    resetVerification,
    isWorldAppInstalled 
  } = useWorldVerification();

  const [showVerification, setShowVerification] = useState(false);

  const handleVerify = async () => {
    const result = await verifyUser(action, signal, verificationLevel);
    
    if (result.success) {
      onVerificationSuccess?.(result.data);
      setShowVerification(false);
    } else {
      onVerificationError?.(result.error);
    }
  };

  const handleCancel = () => {
    resetVerification();
    setShowVerification(false);
  };

  if (!showVerification) {
    return (
      <div className={className}>
        {children || (
          <button
            onClick={() => setShowVerification(true)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Verify with World ID
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verify Your Identity
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isWorldAppInstalled 
              ? "Please open World App to verify your identity and continue. Both Orb and Device verification are accepted."
              : "World App is required for verification. Please install World App first."
            }
          </p>

          {verificationError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">{verificationError}</p>
            </div>
          )}

          {isVerified && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 font-medium">Verification successful!</p>
            </div>
          )}

          <div className="space-y-4">
            {isWorldAppInstalled ? (
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Identity'
                )}
              </button>
            ) : (
              <a
                href="https://worldapp.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 inline-block text-center"
              >
                Install World App
              </a>
            )}

            <button
              onClick={handleCancel}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              World ID verification ensures you're a unique human and prevents bot abuse. 
              Both Orb (higher security) and Device (convenient) verification methods are accepted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
