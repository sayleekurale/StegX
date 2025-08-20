import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Upload, Download, Trash2, Play, Pause, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { encodeStego, extractStego } from "@/lib/stego";

interface BatchItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: Blob;
  error?: string;
  fileName?: string;
}

interface BatchProcessorProps {
  mode: 'encode' | 'decode';
  encryptionKey: string;
}

export const BatchProcessor = ({ mode, encryptionKey }: BatchProcessorProps) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [batchMessage, setBatchMessage] = useState("");

  const addFiles = (files: FileList) => {
    const newItems: BatchItem[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      file,
      status: 'pending'
    }));
    
    setItems(prev => [...prev, ...newItems]);
    toast({ description: `Added ${files.length} files to batch` });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    setCurrentProgress(0);
  };

  const processBatch = async () => {
    if (!encryptionKey.trim()) {
      toast({ description: "Please enter an encryption key", variant: "destructive" });
      return;
    }

    if (mode === 'encode' && !batchMessage.trim()) {
      toast({ description: "Please enter a message to encode", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setCurrentProgress(0);

    const pendingItems = items.filter(item => item.status === 'pending');
    
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      
      try {
        // Update status to processing
        setItems(prev => prev.map(it => 
          it.id === item.id ? { ...it, status: 'processing' as const } : it
        ));

        if (mode === 'encode') {
          // Encrypt and encode message into image
          const encrypted = await encryptMessage(batchMessage, encryptionKey, 1800, false);
          const stegoBlob = await encodeStego(item.file, encrypted);
          
          setItems(prev => prev.map(it => 
            it.id === item.id ? { 
              ...it, 
              status: 'completed' as const,
              result: stegoBlob,
              fileName: `encoded_${item.file.name}`
            } : it
          ));
        } else {
          // Decode mode - extract and decrypt message
          const encrypted = await extractStego(item.file);
          const message = await decryptMessage(encrypted, encryptionKey);
          
          // Create text file blob
          const textBlob = new Blob([message], { type: 'text/plain' });
          
          setItems(prev => prev.map(it => 
            it.id === item.id ? { 
              ...it, 
              status: 'completed' as const,
              result: textBlob,
              fileName: `decoded_${item.file.name.split('.')[0]}.txt`
            } : it
          ));
        }
      } catch (error) {
        setItems(prev => prev.map(it => 
          it.id === item.id ? { 
            ...it, 
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Processing failed'
          } : it
        ));
      }

      setCurrentProgress(((i + 1) / pendingItems.length) * 100);
    }

    setIsProcessing(false);
    toast({ description: "Batch processing completed!" });
  };

  const downloadResults = () => {
    const completedItems = items.filter(item => item.status === 'completed' && item.result);
    
    if (completedItems.length === 0) {
      toast({ description: "No completed items to download", variant: "destructive" });
      return;
    }
    
    completedItems.forEach((item, index) => {
      setTimeout(() => {
        const url = URL.createObjectURL(item.result!);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.fileName || `batch-${mode}-${item.file.name}`;
        a.click();
        URL.revokeObjectURL(url);
      }, index * 500); // Stagger downloads
    });

    toast({ description: `Downloading ${completedItems.length} files...` });
  };

  const getStatusColor = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'default';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const canProcess = items.length > 0 && encryptionKey.trim() && 
    (mode === 'decode' || (mode === 'encode' && batchMessage.trim()));

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Layers className="w-4 h-4" />
          Batch Process
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Batch {mode === 'encode' ? 'Encoding' : 'Decoding'}
          </DialogTitle>
          <DialogDescription>
            Process multiple images at once with the same settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning for missing key */}
          {!encryptionKey.trim() && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">Please enter an encryption key in the main form first</span>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === 'encode' && (
            <div>
              <Label htmlFor="batch-message">Message for all images</Label>
              <Textarea
                id="batch-message"
                value={batchMessage}
                onChange={(e) => setBatchMessage(e.target.value)}
                placeholder="Enter message to encode in all images..."
                className="min-h-[80px]"
              />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => document.getElementById('batch-files')?.click()}
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Images
            </Button>
            <Button
              onClick={processBatch}
              disabled={!canProcess || isProcessing}
            >
              {isProcessing ? (
                <Pause className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Start Batch'}
            </Button>
            <Button
              variant="outline"
              onClick={downloadResults}
              disabled={items.filter(i => i.status === 'completed').length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
            <Button variant="destructive" onClick={clearAll} disabled={isProcessing}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <input
            id="batch-files"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="hidden"
          />

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(currentProgress)}%</span>
              </div>
              <Progress value={currentProgress} />
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate max-w-48">
                        {item.file.name}
                      </span>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(item.file.size / 1024).toFixed(1)} KB
                      {item.error && (
                        <span className="text-destructive ml-2">• {item.error}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={isProcessing}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No images added yet. Click "Add Images" to start batch processing!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};