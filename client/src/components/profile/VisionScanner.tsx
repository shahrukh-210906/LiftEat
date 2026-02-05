import { useRef, useState } from 'react';
import { Camera, Upload, ScanEye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';

export function VisionScanner({ onScanComplete }: { onScanComplete: (data: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      toast.info("AI Analyzing physique...");
      const { data } = await api.post('/vision/analyze-body', formData);
      setResult(data);
      onScanComplete(data);
      toast.success("Analysis Complete!");
    } catch {
      toast.error("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl relative overflow-hidden border border-white/10">
      <div className="absolute top-0 right-0 p-3 opacity-10"><ScanEye className="w-32 h-32" /></div>
      <div className="relative z-10">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
          <Camera className="w-5 h-5 text-indigo-400" /> AI Body Scan
        </h2>
        
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />

        {!result ? (
          <Button onClick={() => fileRef.current?.click()} disabled={analyzing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {analyzing ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 w-4 h-4" />}
            {analyzing ? "Scanning..." : "Upload Photo"}
          </Button>
        ) : (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
             <p className="font-bold text-xl mb-1">{result.body_type}</p>
             <p className="text-sm text-gray-300">{result.suggestion}</p>
             <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="mt-3 w-full">Scan Again</Button>
          </div>
        )}
      </div>
    </div>
  );
}