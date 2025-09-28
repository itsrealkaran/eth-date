# Mopro Web WASM Implementation

This document describes the implementation of mopro web WASM in the eth-date project.

## Overview

Mopro (Mobile Proving) is a toolkit for client-side proving of zero-knowledge proofs. This implementation demonstrates how to integrate mopro's WebAssembly (WASM) capabilities into a Next.js web application.

## Project Structure

```
eth-date/
├── mopro-wasm-lib/           # Rust WASM library
│   ├── Cargo.toml           # Rust dependencies
│   └── src/lib.rs           # WASM wrapper functions
├── MoproWasmBindings/        # Generated WASM bindings
│   ├── mopro_wasm_lib.js    # JavaScript bindings
│   ├── mopro_wasm_lib.wasm  # WebAssembly module
│   └── ...
├── app/
│   ├── hooks/useMopro.js    # React hook for WASM integration
│   └── components/MoproDemo.js # Demo component
└── next.config.mjs          # Next.js WASM configuration
```

## Implementation Details

### 1. Rust WASM Library (`mopro-wasm-lib/`)

The Rust library provides wrapper functions for proof generation and verification:

- `generate_proof(input)` - Generates a ZK proof from private and public inputs
- `verify_proof(proof, public_inputs)` - Verifies a proof against public inputs
- `init_thread_pool(num_threads)` - Initializes multi-threading support

### 2. React Integration

#### useMopro Hook (`app/hooks/useMopro.js`)

Provides a React interface to the WASM module:

```javascript
const { isInitialized, isLoading, error, generateProof, verifyProof } = useMopro();
```

#### MoproDemo Component (`app/components/MoproDemo.js`)

A demonstration component that shows:
- WASM module initialization status
- Proof generation with custom inputs
- Proof verification
- Error handling and loading states

### 3. Next.js Configuration

The `next.config.mjs` file includes:
- WebAssembly async support
- WASM file handling
- Cross-origin headers for WASM execution
- Node.js module fallbacks for client-side

## Usage

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the demo:**
   - Navigate to the application
   - The Mopro demo will initialize automatically
   - Enter private and public inputs
   - Generate and verify proofs

## Building WASM Module

To rebuild the WASM module:

```bash
cd mopro-wasm-lib
wasm-pack build --target web --out-dir ../MoproWasmBindings
```

## Features Demonstrated

- ✅ WASM module initialization
- ✅ Proof generation with custom inputs
- ✅ Proof verification
- ✅ Error handling and loading states
- ✅ Multi-threading support (placeholder)
- ✅ Integration with existing React components

## Notes

- This is a demonstration implementation using simulated proofs
- In production, replace with actual Halo2 or other ZK circuit implementations
- The current implementation provides a foundation for integrating real ZK circuits
- Thread pool initialization is implemented as a placeholder for future multi-threading support

## References

- [Mopro Documentation](https://zkmopro.org/docs/setup/web-wasm-setup)
- [WebAssembly with Next.js](https://nextjs.org/docs/advanced-features/using-webassembly)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
