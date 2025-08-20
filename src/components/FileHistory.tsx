import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { History, Download, Trash2, Eye, FileImage, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface HistoryItem {
  id: string;
  type: 'encode' | 'decode';
  mode: 'text' | 'image';
  fileName: string;
  timestamp: number;
  size?: number;
  result?: string;
  imageUrl?: string;
}

export const FileHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stegx-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // Clear corrupted data
        localStorage.removeItem('stegx-history');
      }
    }
  }, []);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    setHistory(prev => {
      const updatedHistory = [newItem, ...prev].slice(0, 50);
      localStorage.setItem('stegx-history', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('stegx-history');
    toast({ description: "History cleared" });
  };

  const deleteItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('stegx-history', JSON.stringify(updatedHistory));
    toast({ description: "Item removed from history" });
  };

  const downloadResult = (item: HistoryItem) => {
    if (item.result) {
      const blob = new Blob([item.result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decoded-${item.fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (item.imageUrl) {
      const a = document.createElement('a');
      a.href = item.imageUrl;
      a.download = `processed-${item.fileName}`;
      a.click();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  };

  // Expose addToHistory globally for other components to use
  useEffect(() => {
    (window as any).addToStegxHistory = addToHistory;
  }, [addToHistory]);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" />
          History ({history.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Processing History
          </DialogTitle>
          <DialogDescription>
            View your recent encoding and decoding activities
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {history.length > 0 && (
            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={clearHistory}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
          
          {history.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {item.mode === 'text' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <FileImage className="w-4 h-4" />
                    )}
                    <span className="font-medium">{item.fileName}</span>
                    <Badge variant={item.type === 'encode' ? 'default' : 'secondary'}>
                      {item.type}
                    </Badge>
                    <Badge variant="outline">{item.mode}</Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </p>
                    {item.size && (
                      <p>Size: {formatFileSize(item.size)}</p>
                    )}
                    {item.result && (
                      <p className="font-mono text-xs bg-muted p-2 rounded truncate">
                        {item.result.substring(0, 100)}
                        {item.result.length > 100 && '...'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 ml-4">
                  {(item.result || item.imageUrl) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadResult(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {history.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No history yet. Start encoding or decoding to see your activity here!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};