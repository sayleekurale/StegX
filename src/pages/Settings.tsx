import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { getDeviceId } from "@/lib/crypto";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Fingerprint, 
  Trash2, 
  User, 
  Info,
  ArrowLeft,
  Github,
  Twitter,
  Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [deviceId] = useState(getDeviceId());

  const clearDecodedMessages = () => {
    const keys = Object.keys(localStorage);
    const decodedKeys = keys.filter(key => key.startsWith('decoded_'));
    decodedKeys.forEach(key => localStorage.removeItem(key));
    toast({ 
      title: "Cleared successfully", 
      description: `Removed ${decodedKeys.length} decoded message locks` 
    });
  };

  const clearAllData = () => {
    localStorage.clear();
    toast({ 
      title: "All data cleared", 
      description: "Device ID and message history removed" 
    });
    window.location.reload();
  };

  return (
    <main className="min-h-screen app-surface">
      <Helmet>
        <title>StegX – Settings</title>
        <meta name="description" content="Manage your StegX security settings, view app information, and clear data." />
      </Helmet>
      
      <section className="container py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/home')}
            className="text-cyber-blue hover:bg-cyber-blue/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20">
              <SettingsIcon className="h-6 w-6 text-cyber-blue" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Security Settings */}
          <Card className="glass-card border-cyber-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyber-blue">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-cyber-blue/10">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-cyber-green" />
                  <div>
                    <div className="font-medium">Device ID</div>
                    <div className="text-sm text-muted-foreground">Unique identifier for device-bound messages</div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {deviceId.slice(0, 8)}...
                </Badge>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={clearDecodedMessages}
                  className="border-cyber-blue/20 hover:bg-cyber-blue/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Decoded Locks
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={clearAllData}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About StegX */}
          <Card className="glass-card border-cyber-purple/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyber-purple">
                <Info className="h-5 w-5" />
                About StegX
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Secure Image Steganography</h3>
                <p className="text-muted-foreground">
                  StegX is a cutting-edge steganography application that allows you to hide encrypted 
                  messages inside images. Using advanced AES-GCM encryption and LSB steganography 
                  techniques, your secrets remain invisible and secure.
                </p>
              </div>
              
              <Separator className="bg-cyber-purple/20" />
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-cyber-blue">Key Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Time-limited message access</li>
                    <li>• One-time decode protection</li>
                    <li>• Device-specific binding</li>
                    <li>• Offline QR code sharing</li>
                    <li>• Military-grade encryption</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-cyber-green">Technology</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AES-GCM 256-bit encryption</li>
                    <li>• LSB steganography method</li>
                    <li>• React + Capacitor framework</li>
                    <li>• No cloud dependencies</li>
                    <li>• Open source security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Founder & Team */}
          <Card className="glass-card border-cyber-green/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyber-green">
                <User className="h-5 w-5" />
                Founder & Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Lovable AI Team</h3>
                  <p className="text-muted-foreground mb-3">
                    StegX was developed using Lovable's AI-powered development platform, 
                    combining human creativity with artificial intelligence to build secure, 
                    privacy-focused applications.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="border-cyber-blue/20">
                      <Github className="h-4 w-4 mr-2" />
                      Source
                    </Button>
                    <Button variant="outline" size="sm" className="border-cyber-purple/20">
                      <Twitter className="h-4 w-4 mr-2" />
                      Updates
                    </Button>
                    <Button variant="outline" size="sm" className="border-cyber-green/20">
                      <Mail className="h-4 w-4 mr-2" />
                      Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App History */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">v2.0.0 - Cyber Security Update</div>
                      <div className="text-sm text-muted-foreground">Added time-limited access and one-time decode</div>
                    </div>
                    <Badge className="bg-cyber-blue/10 text-cyber-blue">Latest</Badge>
                  </div>
                  <Separator className="bg-primary/10" />
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">v1.5.0 - UI Enhancement</div>
                      <div className="text-sm text-muted-foreground">Cyberpunk theme and responsive design</div>
                    </div>
                    <Badge variant="outline">Previous</Badge>
                  </div>
                  <Separator className="bg-primary/10" />
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">v1.0.0 - Initial Release</div>
                      <div className="text-sm text-muted-foreground">Basic steganography and QR code features</div>
                    </div>
                    <Badge variant="outline">Archive</Badge>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Settings;