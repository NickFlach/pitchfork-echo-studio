import { CorruptionDetectionDashboard } from "@/components/consciousness/CorruptionDetectionDashboard";

const Consciousness = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-blue-900/20" data-testid="page-consciousness">
      <div className="container mx-auto px-4 py-8">
        <CorruptionDetectionDashboard />
      </div>
    </div>
  );
};

export default Consciousness;