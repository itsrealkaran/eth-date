'use client';

import { useState, useEffect, useCallback } from 'react';

export function useMopro() {
    const [moproWasm, setMoproWasm] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize the WASM module
    useEffect(() => {
        const initMopro = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Dynamically import the WASM module
                const mopro_wasm = await import('../../../MoproWasmBindings/mopro_wasm_lib.js');

                // Initialize the WASM module
                await mopro_wasm.default();

                // Initialize thread pool for multi-threading support
                await mopro_wasm.init_thread_pool(navigator.hardwareConcurrency || 4);

                setMoproWasm(mopro_wasm);
                setIsInitialized(true);

                console.log('Mopro WASM initialized successfully');
            } catch (err) {
                console.error('Failed to initialize Mopro WASM:', err);
                setError(err.message || 'Failed to initialize Mopro WASM');
            } finally {
                setIsLoading(false);
            }
        };

        initMopro();
    }, []);

    // Generate a proof
    const generateProof = useCallback(async (privateInput, publicInput) => {
        if (!isInitialized || !moproWasm) {
            throw new Error('Mopro WASM not initialized');
        }

        try {
            setIsLoading(true);
            setError(null);

            const input = {
                private_input: privateInput,
                public_input: publicInput
            };

            const proof = await moproWasm.generate_proof(input);
            console.log('Proof generated:', proof);
            return proof;
        } catch (err) {
            console.error('Failed to generate proof:', err);
            setError(err.message || 'Failed to generate proof');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isInitialized, moproWasm]);

    // Verify a proof
    const verifyProof = useCallback(async (proof, publicInputs) => {
        if (!isInitialized || !moproWasm) {
            throw new Error('Mopro WASM not initialized');
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await moproWasm.verify_proof(proof, publicInputs);
            console.log('Proof verification result:', result);
            return result;
        } catch (err) {
            console.error('Failed to verify proof:', err);
            setError(err.message || 'Failed to verify proof');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isInitialized, moproWasm]);

    return {
        isInitialized,
        isLoading,
        error,
        generateProof,
        verifyProof
    };
}
