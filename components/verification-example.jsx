import { useState } from 'react';
import WorldVerification from './world-verification';

// Example component showing different ways to use World ID verification
export default function VerificationExample() {
  const [verificationStatus, setVerificationStatus] = useState(null);

  const handleVerificationSuccess = (data) => {
    console.log('Verification successful:', data);
    setVerificationStatus('verified');
    // Handle successful verification
    // e.g., enable premium features, unlock content, etc.
  };

  const handleVerificationError = (error) => {
    console.error('Verification failed:', error);
    setVerificationStatus('failed');
    // Handle verification error
    // e.g., show error message, retry option, etc.
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">World ID Verification Examples</h2>
      
      {/* Example 1: Basic verification button */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Basic Verification</h3>
        <WorldVerification
          onVerificationSuccess={handleVerificationSuccess}
          onVerificationError={handleVerificationError}
          action="basic-verification"
        />
      </div>

      {/* Example 2: Custom verification with signal */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Custom Verification</h3>
        <WorldVerification
          onVerificationSuccess={handleVerificationSuccess}
          onVerificationError={handleVerificationError}
          action="custom-action"
          signal="user-specific-data"
          verificationLevel="orb"
        >
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Verify for Premium Access
          </button>
        </WorldVerification>
      </div>

      {/* Example 3: Device-level verification */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Device Verification</h3>
        <WorldVerification
          onVerificationSuccess={handleVerificationSuccess}
          onVerificationError={handleVerificationError}
          action="device-verification"
          verificationLevel="device"
        >
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Verify Device
          </button>
        </WorldVerification>
      </div>

      {/* Verification Status */}
      {verificationStatus && (
        <div className={`p-4 rounded-lg ${
          verificationStatus === 'verified' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          Status: {verificationStatus}
        </div>
      )}
    </div>
  );
}
