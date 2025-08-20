import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Lock, Unlock, Shield, QrCode, Settings, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuickActions } from "@/components/QuickActions";
import { SecurityFeatures } from "@/components/SecurityFeatures";
const Home = () => {
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen app-surface animate-fade-in">
      <Helmet>
        <title>StegX – Home</title>
        <meta name="description" content="StegX: Hide and reveal encrypted messages inside images. QR keys, secure, fast." />
      </Helmet>
      <section className="container px-4 py-6 md:py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          <div className="space-y-3 md:space-y-4">
            <div className="mx-auto mb-4 md:mb-6 flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl border border-primary/40 neon-border transition-all duration-300 hover:scale-110">
              <Shield className="text-primary h-6 w-6 md:h-10 md:w-10" />
            </div>
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight font-cyber gradient-text">StegX</h1>
            <div className="w-12 md:w-16 h-0.5 md:h-1 bg-gradient-to-r from-cyber-blue to-cyber-purple mx-auto rounded-full"></div>
          </div>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            Advanced steganography platform for hiding and revealing encrypted messages inside images with military-grade security
          </p>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8 md:mt-12 px-2">
            <div className="text-center p-3 md:p-4 rounded-lg md:rounded-xl bg-cyber-blue/5 border border-cyber-blue/10">
              <div className="text-lg md:text-2xl font-bold text-cyber-blue">256-bit</div>
              <div className="text-xs md:text-sm text-muted-foreground">AES Encryption</div>
            </div>
            <div className="text-center p-3 md:p-4 rounded-lg md:rounded-xl bg-cyber-green/5 border border-cyber-green/10">
              <div className="text-lg md:text-2xl font-bold text-cyber-green">100%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Invisible</div>
            </div>
            <div className="text-center p-3 md:p-4 rounded-lg md:rounded-xl bg-cyber-purple/5 border border-cyber-purple/10">
              <div className="text-lg md:text-2xl font-bold text-cyber-purple">Unlimited</div>
              <div className="text-xs md:text-sm text-muted-foreground">File Size</div>
            </div>
            <div className="text-center p-3 md:p-4 rounded-lg md:rounded-xl bg-cyber-blue/5 border border-cyber-blue/10">
              <div className="text-lg md:text-2xl font-bold text-cyber-blue">Device</div>
              <div className="text-xs md:text-sm text-muted-foreground">Binding</div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 mb-12 md:mb-16 px-2">
          <Card className="glass hover-scale group transition-all duration-300 hover:border-cyber-blue/40">
            <CardHeader className="flex flex-row items-center gap-3 md:gap-4 pb-3 md:pb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-cyber-blue/10 flex items-center justify-center group-hover:bg-cyber-blue/20 transition-colors">
                <Lock className="h-5 w-5 md:h-6 md:w-6 text-cyber-blue" />
              </div>
              <CardTitle className="text-lg md:text-xl">Encode Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Pick a photo, enter your secret, encrypt with a key, and save the stego image.</p>
              <Button asChild variant="hero" className="w-full h-11 md:h-12">
                <Link to="/encode" aria-label="Go to encode screen">Start Encoding</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass hover-scale group transition-all duration-300 hover:border-cyber-purple/40">
            <CardHeader className="flex flex-row items-center gap-3 md:gap-4 pb-3 md:pb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-cyber-purple/10 flex items-center justify-center group-hover:bg-cyber-purple/20 transition-colors">
                <Unlock className="h-5 w-5 md:h-6 md:w-6 text-cyber-purple" />
              </div>
              <CardTitle className="text-lg md:text-xl">Decode Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Select a stego image and decrypt it using your key or a scanned QR code.</p>
              <Button asChild variant="outline" className="w-full h-11 md:h-12">
                <Link to="/decode" aria-label="Go to decode screen">Start Decoding</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features Section */}
        <div className="space-y-8 md:space-y-12 mb-12 md:mb-16 px-2">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-xl md:text-3xl font-bold">Advanced Security Features</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade steganography with cutting-edge security measures
            </p>
          </div>
          
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass border-cyber-blue/20 hover-scale transition-all duration-300 hover:border-cyber-blue/40">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-cyber-blue/10 flex items-center justify-center mb-3 md:mb-4">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-cyber-blue" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">Military-Grade Encryption</h3>
                <p className="text-xs md:text-sm text-muted-foreground">AES-256 encryption with device binding and time-based expiry.</p>
              </CardContent>
            </Card>
            
            <Card className="glass border-cyber-green/20 hover-scale transition-all duration-300 hover:border-cyber-green/40">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-cyber-green/10 flex items-center justify-center mb-3 md:mb-4">
                  <QrCode className="h-5 w-5 md:h-6 md:w-6 text-cyber-green" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">QR Key Sharing</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Generate and share encryption keys via QR codes securely.</p>
              </CardContent>
            </Card>
            
            <Card className="glass border-cyber-purple/20 hover-scale transition-all duration-300 hover:border-cyber-purple/40 md:col-span-2 lg:col-span-1">
              <CardContent className="p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-cyber-purple/10 flex items-center justify-center mb-3 md:mb-4">
                  <Eye className="h-5 w-5 md:h-6 md:w-6 text-cyber-purple" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">Invisible Integration</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Messages are completely invisible, preserving image quality.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 px-2">
          <QuickActions 
            onTemplateAction={(action) => {
              // Navigate to encode with the selected template type
              navigate("/encode", { state: { templateAction: action } });
            }}
          />
          
          {/* Security Features */}
          <SecurityFeatures />
        </div>

        {/* Mobile-optimized floating buttons */}
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-2 md:gap-3 z-50">
          <Button 
            variant="secondary" 
            className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0 border-cyber-purple/20 hover:bg-cyber-purple/10 shadow-lg" 
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4 md:h-5 md:w-5 text-cyber-purple" />
          </Button>
          
          <div className="group relative">
            <Button variant="secondary" className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0 shadow-lg" aria-label="What is steganography?">
              <QrCode className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="pointer-events-none absolute bottom-12 md:bottom-14 right-0 w-56 md:w-64 translate-y-2 rounded-lg border border-border bg-popover p-3 text-xs md:text-sm text-muted-foreground opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100 z-50">
              Steganography hides data inside media. Here, your AES‑encrypted message is embedded into the least significant bits of an image.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
