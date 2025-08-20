import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Save, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onSave?: () => void;
}

export function AutoCleanupDialog({ open, onOpenChange, message, onSave }: AutoCleanupDialogProps) {
  const [timeLeft, setTimeLeft] = useState(60); // Default 60 seconds
  const [autoSave, setAutoSave] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && !hasStarted) {
      setHasStarted(true);
      setTimeLeft(60);
    }
  }, [open, hasStarted]);

  useEffect(() => {
    if (!open || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-cleanup triggered
          if (autoSave && onSave) {
            onSave();
            toast({
              title: "Message Saved",
              description: "Message saved before auto-cleanup",
            });
          }
          onOpenChange(false);
          toast({
            title: "Message Deleted",
            description: "Message automatically cleaned up for security",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, timeLeft, autoSave, onSave, onOpenChange, toast]);

  const handleSaveNow = () => {
    if (onSave) {
      onSave();
      toast({
        title: "Message Saved",
        description: "Message has been saved successfully",
      });
    }
  };

  const handleDeleteNow = () => {
    onOpenChange(false);
    toast({
      title: "Message Deleted",
      description: "Message manually deleted for security",
      variant: "destructive",
    });
  };

  const progressPercentage = (timeLeft / 60) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-cyber-card border-cyber-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyber-text">
            <Timer className="h-5 w-5 text-primary" />
            Auto-Cleanup Active
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Countdown Display */}
          <Card className="border-cyber-accent/20 bg-cyber-accent/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="text-3xl font-mono font-bold text-primary">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-cyber-text justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  Message will be deleted automatically
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Preview */}
          <Card className="border-cyber-border/50">
            <CardContent className="pt-4">
              <div className="max-h-32 overflow-y-auto">
                <p className="text-sm text-cyber-text break-words">
                  {message.length > 200 ? `${message.substring(0, 200)}...` : message}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Auto-save Toggle */}
          <div className="flex items-center justify-between p-3 rounded-md bg-cyber-accent/10 border border-cyber-accent/20">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-cyber-text" />
              <span className="text-sm text-cyber-text">Auto-save before cleanup</span>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {onSave && (
              <Button 
                onClick={handleSaveNow}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Now
              </Button>
            )}
            <Button 
              onClick={handleDeleteNow}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}