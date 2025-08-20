import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Timer, Lock, Zap, Eye, FileImage } from "lucide-react";

export const SecurityFeatures = () => {
  return (
    <Card className="border-cyber-blue/20 bg-gradient-to-br from-cyber-blue/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyber-blue">
          <Shield className="w-5 h-5" />
          Security Features
        </CardTitle>
        <CardDescription>
          Enterprise-grade protection for your hidden messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-cyber-blue/10 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyber-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">AES-256 Encryption</span>
                <Badge variant="outline" className="text-xs">Military Grade</Badge>
              </div>
              <p className="text-xs text-muted-foreground">End-to-end encryption with industry standard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-cyber-purple/10 rounded-lg flex items-center justify-center">
              <Timer className="w-4 h-4 text-cyber-purple" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Auto-Expiry</span>
                <Badge variant="outline" className="text-xs">Self-Destruct</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Messages automatically expire after set time</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-cyber-green/10 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-cyber-green" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">One-Time Read</span>
                <Badge variant="outline" className="text-xs">Single Use</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Messages can only be read once</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <FileImage className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Invisible Hiding</span>
                <Badge variant="outline" className="text-xs">Steganography</Badge>
              </div>
              <p className="text-xs text-muted-foreground">No visible changes to cover images</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};