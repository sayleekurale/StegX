import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  ImageIcon, 
  FileText, 
  Info, 
  Shield, 
  Smartphone, 
  Cloud, 
  Timer,
  Lock
} from "lucide-react";

interface QuickActionsProps {
  onTemplateAction?: (action: string) => void;
}

export const QuickActions = ({ onTemplateAction }: QuickActionsProps) => {
  const [showInfo, setShowInfo] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description: "AES-256 encryption with device binding and auto-expiry",
      badge: "Security"
    },
    {
      icon: Zap,
      title: "Smart Compression",
      description: "AI-powered message optimization for better hiding",
      badge: "AI"
    },
    {
      icon: ImageIcon,
      title: "Image Analysis",
      description: "ML-based suitability scoring for optimal steganography",
      badge: "ML"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Native Android support with offline capabilities",
      badge: "Mobile"
    }
  ];

  const quickActions = [
    {
      title: "Hide Meeting Details",
      description: "Secure meeting information sharing",
      action: "meeting",
      color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
    },
    {
      title: "Share Passwords",
      description: "Safely transmit credentials",
      action: "password",
      color: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
    },
    {
      title: "Send Coordinates",
      description: "Hide location data",
      action: "location",
      color: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20"
    },
    {
      title: "Backup Seeds",
      description: "Store crypto wallet seeds",
      action: "crypto",
      color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Info className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Why StegX is Different</DialogTitle>
              <DialogDescription>
                Advanced steganography with enterprise-grade security
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <feature.icon className="w-5 h-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{feature.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">256-bit</div>
                <div className="text-xs text-muted-foreground">Encryption</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-xs text-muted-foreground">Undetectable</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">0ms</div>
                <div className="text-xs text-muted-foreground">Cloud Dependency</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-xs text-muted-foreground">Image Formats</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Card 
              key={action.action}
              className={`cursor-pointer transition-all hover:scale-105 ${action.color}`}
              onClick={() => onTemplateAction?.(action.action)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{action.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Lock className="w-3 h-3" />
                    <span>Auto-expires</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            <span>Messages auto-expire</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Device-bound security</span>
          </div>
          <div className="flex items-center gap-1">
            <Cloud className="w-3 h-3 line-through" />
            <span>100% offline</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};