'use client';

import { useState } from 'react';
import { useMopro } from '../hooks/useMopro';

export default function MoproDemo() {
    const { isInitialized, isLoading, error, generateProof, verifyProof } = useMopro();
    const [privateInput, setPrivateInput] = useState('42');
    const [publicInput, setPublicInput] = useState('100');
    const [proof, setProof] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);
    const [demoError, setDemoError] = useState(null);

    const handleGenerateProof = async () => {
        try {
            setDemoError(null);
            setVerificationResult(null);

            const privateVal = parseInt(privateInput);
            const publicVal = parseInt(publicInput);

            if (isNaN(privateVal) || isNaN(publicVal)) {
                throw new Error('Please enter valid numbers');
            }

            const generatedProof = await generateProof(privateVal, publicVal);
            setProof(generatedProof);
        } catch (err) {
            setDemoError(err.message);
        }
    };

    const handleVerifyProof = async () => {
        if (!proof) {
            setDemoError('No proof to verify. Generate a proof first.');
            return;
        }

        try {
            setDemoError(null);
            const publicInputs = [parseInt(publicInput)];
            const result = await verifyProof(proof.proof, publicInputs);
            setVerificationResult(result);
        } catch (err) {
            setDemoError(err.message);
        }
    };

    if (!isInitialized && isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Initializing Mopro WASM...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-red-800 font-medium">Initialization Error</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mopro ZK Proof Demo</h2>

            {/* Status indicator */}
            <div className="mb-6">
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm text-gray-600">
                        {isInitialized ? 'Mopro WASM Ready' : 'Initializing...'}
                    </span>
                </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Private Input
                    </label>
                    <input
                        type="number"
                        value={privateInput}
                        onChange={(e) => setPrivateInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter private input"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Public Input
                    </label>
                    <input
                        type="number"
                        value={publicInput}
                        onChange={(e) => setPublicInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter public input"
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                    onClick={handleGenerateProof}
                    disabled={!isInitialized || isLoading}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate Proof'}
                </button>
                <button
                    onClick={handleVerifyProof}
                    disabled={!isInitialized || isLoading || !proof}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Verifying...' : 'Verify Proof'}
                </button>
            </div>

            {/* Error display */}
            {demoError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">{demoError}</p>
                </div>
            )}

            {/* Proof display */}
            {proof && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Generated Proof</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <div className="text-sm text-gray-600 mb-2">
                            <strong>Proof Length:</strong> {proof.proof.length} bytes
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                            <strong>Public Inputs:</strong> [{proof.public_inputs.join(', ')}]
                        </div>
                        <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(proof, null, 2)}
                        </div>
                    </div>
                </div>
            )}

            {/* Verification result */}
            {verificationResult !== null && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Verification Result</h3>
                    <div className={`border rounded-md p-4 ${verificationResult ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${verificationResult ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`font-medium ${verificationResult ? 'text-green-800' : 'text-red-800'}`}>
                                {verificationResult ? 'Proof Valid ✓' : 'Proof Invalid ✗'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Info section */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-blue-800 font-medium mb-2">About This Demo</h4>
                <p className="text-blue-700 text-sm">
                    This demonstrates mopro web WASM integration with a simple proof system.
                    The private input is used internally for proof generation, while the public input
                    is part of the proof verification process. In a real ZK application, this would
                    use actual cryptographic circuits like Halo2.
                </p>
            </div>
        </div>
    );
}
