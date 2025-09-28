
import NFCScanner from './components/NFCScanner';
import MoproDemo from './components/MoproDemo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ETH Date</h1>
          <p className="text-gray-600">NFC Scanner & Mopro ZK Proof Demo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <NFCScanner />
          <MoproDemo />
        </div>
      </div>
    </div>
  );
}
