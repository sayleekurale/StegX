import { useState, useMemo, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "react-qr-code";
import { toast } from "@/hooks/use-toast";
import { encryptMessage } from "@/lib/crypto";
import { encodeStego, encodeImageStego } from "@/lib/stego";
import { analyzeImageSuitability, ImageAnalysis } from "@/lib/imageAnalysis";
import { compressMessage, shouldCompress, CompressionResult } from "@/lib/compression";
import { ImageAnalysisCard } from "@/components/ImageAnalysisCard";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Lock, Shield, Loader2, QrCode, Timer, Download, Eye, EyeOff, Gauge, Zap, Image, MessageSquare, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MessageTemplates } from "@/components/MessageTemplates";
import { SampleImageSelector } from "@/components/SampleImageSelector";
const Encode = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [hiddenImageFile, setHiddenImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"text" | "image">("text");
  const [key, setKey] = useState("");
  const [expiresIn, setExpiresIn] = useState<number>(1800);
  const [bindToDevice, setBindToDevice] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(30);
  const [qrExpired, setQrExpired] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stegoUrl, setStegoUrl] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSampleImageId, setSelectedSampleImageId] = useState<string | undefined>();

  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);
  const hiddenImagePreview = useMemo(() => (hiddenImageFile ? URL.createObjectURL(hiddenImageFile) : null), [hiddenImageFile]);
  const qrRef = useRef<HTMLDivElement>(null);

  const expiryOptions = [
    { value: 300, label: "5 minutes" },
    { value: 1800, label: "30 minutes" },
    { value: 3600, label: "1 hour" },
    { value: 86400, label: "24 hours" }
  ];

  // QR countdown timer
  useEffect(() => {
    if (showQRModal && qrCountdown > 0) {
      const timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            setQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQRModal, qrCountdown]);

  async function downloadQR() {
    const container = qrRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;
    
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = document.createElement('img');
      
      img.onload = async () => {
        const size = Math.max(img.width, img.height) || 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          try {
            if (Capacitor.isNativePlatform()) {
              // Mobile: Save to filesystem and share
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  const base64Data = (reader.result as string).split(',')[1];
                  const fileName = `encryption-key-qr-${Date.now()}.png`;
                  
                  const result = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Documents
                  });
                  
                  await Share.share({
                    title: 'QR Code',
                    text: 'Your encryption key QR code',
                    url: result.uri,
                    dialogTitle: 'Save QR Code'
                  });
                  
                  toast({
                    title: "QR Code Saved",
                    description: "QR code saved to Documents folder"
                  });
                } catch (error) {
                  console.error('Failed to save QR code:', error);
                  toast({
                    title: "Save Failed",
                    description: "Could not save QR code to device",
                    variant: "destructive"
                  });
                }
              };
              reader.readAsDataURL(blob);
            } else {
              // Web: Traditional download
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'encryption-key-qr.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }
          } catch (error) {
            console.error('Download failed:', error);
            toast({
              title: "Download Failed",
              description: "Could not download QR code",
              variant: "destructive"
            });
          }
        }, 'image/png');
        
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast({
          title: "Error",
          description: "Failed to process QR code",
          variant: "destructive"
        });
      };
      
      img.src = url;
    } catch (error) {
      console.error('QR download error:', error);
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      });
    }
  }
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedSampleImageId(undefined); // Clear sample selection when uploading
    await analyzeAndSetImage(file);
  };

  const handleSampleImageSelect = async (file: File, imageId: string) => {
    setSelectedSampleImageId(imageId);
    await analyzeAndSetImage(file);
  };

  const analyzeAndSetImage = async (file: File) => {
    setImageFile(file);
    setImageAnalysis(null);
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeImageSuitability(file);
      setImageAnalysis(analysis);
      
      if (analysis.score < 40) {
        toast({
          title: "Image Quality Warning",
          description: "This image may not be suitable for steganography. Consider choosing another image.",
        });
      }
    } catch (error) {
      console.error("Failed to analyze image:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze image quality",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function onEncode() {
    if (!imageFile) {
      toast({ title: "Please select a cover image" });
      return;
    }
    
    if (mode === "text" && (!message || !key)) {
      toast({ title: "Enter message and key" });
      return;
    }
    
    if (mode === "image" && (!hiddenImageFile || !key)) {
      toast({ title: "Select hidden image and key" });
      return;
    }

    try {
      setProcessing(true);
      let stegoBlob: Blob;
      
      if (mode === "text") {
        // Check if compression would be beneficial
        const useCompression = shouldCompress(message);
        let compression: CompressionResult | null = null;

        if (useCompression) {
          compression = compressMessage(message);
          setCompressionResult(compression);
          
          toast({
            title: "Message Optimized",
            description: `Compressed by ${Math.round((1 - compression.ratio) * 100)}% for better hiding`,
          });
        }

        const messageToEncrypt = useCompression && compression ? 
          JSON.stringify({ compressed: true, data: Array.from(compression.compressed) }) : 
          message;
          
        const encrypted = await encryptMessage(messageToEncrypt, key, expiresIn, false); // Always false for cross-device compatibility
        stegoBlob = await encodeStego(imageFile, encrypted);
      } else {
        // Image mode - directly encode image without encryption for now
        stegoBlob = await encodeImageStego(imageFile, hiddenImageFile!);
      }
      
      const url = URL.createObjectURL(stegoBlob);
      setStegoUrl(url);
      
      // Show QR modal after successful encoding
      setQrCountdown(30);
      setQrExpired(false);
      setShowQRModal(true);
      
      // Add to history
      if ((window as any).addToStegxHistory) {
        (window as any).addToStegxHistory({
          type: 'encode',
          mode: mode,
          fileName: imageFile.name,
          size: stegoBlob.size,
          imageUrl: url
        });
      }
      
      // Handle mobile download/share
      try {
        if (Capacitor.isNativePlatform()) {
          // Mobile: Save to filesystem and share
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = document.createElement('img');
              
              img.onload = async () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                
                // Use maximum quality to prevent compression artifacts
                canvas.toBlob(async (blob) => {
                  if (!blob) return;
                  
                  const reader = new FileReader();
                  reader.onload = async () => {
                    try {
                      const base64Data = (reader.result as string).split(',')[1];
                      const fileName = `stego-image-${Date.now()}.png`;
                      
                      const result = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: Directory.Documents
                      });
                      
                      await Share.share({
                        title: 'Stego Image',
                        text: 'Your encoded steganographic image',
                        url: result.uri,
                        dialogTitle: 'Save Stego Image'
                      });
                      
                      toast({
                        title: "Image Saved",
                        description: "Stego image saved to Documents folder"
                      });
                    } catch (error) {
                      console.error('Failed to save stego image:', error);
                      toast({
                        title: "Save Failed",
                        description: "Could not save image to device",
                        variant: "destructive"
                      });
                    }
                  };
                  reader.readAsDataURL(blob);
                }, 'image/png', 1.0); // Maximum quality
              };
              
              img.src = URL.createObjectURL(stegoBlob);
        }
      } catch (error) {
        console.error('Share failed:', error);
      }
      
      toast({ 
        title: "Encoding complete!", 
        description: mode === "text" 
          ? `Message expires in ${expiryOptions.find(o => o.value === expiresIn)?.label}`
          : "Hidden image embedded successfully"
      });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Encoding failed", description: e?.message ?? "Try another image or smaller content." });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="min-h-screen app-surface animate-fade-in">
      <Helmet>
        <title>StegX – Encode</title>
        <meta name="description" content="Encrypt a message with a key and hide it inside an image. Save or share the stego file." />
      </Helmet>
      
      {/* Header with navigation */}
      <div className="container pt-4 md:pt-6 px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="gap-2 h-9 md:h-10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Encode Message</h1>
              <p className="text-sm md:text-base text-muted-foreground">Hide your secret content inside an image</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mb-6 md:mb-8 px-4">
        <div className="flex items-center justify-center space-x-3 md:space-x-8 overflow-x-auto">
          <div className="flex items-center flex-shrink-0">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-cyber-blue text-white flex items-center justify-center text-sm md:text-base font-medium">
              1
            </div>
            <span className="ml-2 text-sm md:text-base font-medium whitespace-nowrap">Choose Image</span>
          </div>
          <div className="h-px flex-1 bg-border max-w-12 md:max-w-24"></div>
          <div className="flex items-center flex-shrink-0">
            <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-medium ${
              message || hiddenImageFile ? 'bg-cyber-blue text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm md:text-base font-medium whitespace-nowrap">Add Content</span>
          </div>
          <div className="h-px flex-1 bg-border max-w-12 md:max-w-24"></div>
          <div className="flex items-center flex-shrink-0">
            <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-medium ${
              key ? 'bg-cyber-blue text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm md:text-base font-medium whitespace-nowrap">Secure & Encode</span>
          </div>
        </div>
      </div>

      <section className="container pb-8 md:pb-12 px-4">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="order-1 lg:order-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyber-blue text-white text-sm flex items-center justify-center font-medium">1</div>
                  Choose Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Image Selector */}
                <SampleImageSelector 
                  selectedImageId={selectedSampleImageId}
                  onImageSelect={handleSampleImageSelect}
                />
                
                <div className="text-center text-sm text-muted-foreground">
                  or upload your own image
                </div>
                
                <Input type="file" accept="image/*" onChange={handleImageChange} aria-label="Select image" />
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Selected image preview for encoding" className="w-full rounded-md border border-border" />
                    <div className="absolute top-2 right-2 bg-cyber-blue/90 text-white px-2 py-1 rounded text-xs">
                      Cover Image
                    </div>
                  </div>
                )}
                
                {/* Image Analysis */}
                {isAnalyzing && (
                  <Card className="border-cyber-blue/20 bg-cyber-blue/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Gauge className="h-5 w-5 text-cyber-blue animate-spin" />
                        <span className="text-cyber-blue">Analyzing image suitability...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {imageAnalysis && (
                  <ImageAnalysisCard analysis={imageAnalysis} />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="order-2 lg:order-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyber-purple text-white text-sm flex items-center justify-center font-medium">2</div>
                  Secret Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              {/* Mode Selection */}
              <Tabs value={mode} onValueChange={(v) => setMode(v as "text" | "image")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Text Message
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Hidden Image
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4 mt-4">
                  {/* Message Templates */}
                  <MessageTemplates onTemplateSelect={setMessage} />
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Secret Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Type your secret message..." 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[100px] border-cyber-blue/20 focus:border-cyber-blue/40"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Characters: {message.length}/5000</span>
                      <span>Words: {message.split(' ').filter(w => w.length > 0).length}</span>
                    </div>

                    {/* Compression Info */}
                    {message.length > 100 && shouldCompress(message) && (
                      <Card className="border-cyber-green/20 bg-cyber-green/5">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-cyber-green" />
                            <span className="text-cyber-green">Auto-compression will be applied for better hiding efficiency</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {compressionResult && (
                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardContent className="pt-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2 text-green-400">
                              <Zap className="h-4 w-4" />
                              <span>Message Compressed Successfully</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Size reduced from {compressionResult.originalSize} to {compressionResult.compressedSize} bytes 
                              ({Math.round((1 - compressionResult.ratio) * 100)}% smaller)
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="hidden-image">Hidden Image</Label>
                    <Input 
                      id="hidden-image"
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setHiddenImageFile(e.target.files?.[0] ?? null)} 
                      className="border-cyber-purple/20 focus:border-cyber-purple/40"
                    />
                    {hiddenImagePreview && (
                      <div className="relative">
                        <img 
                          src={hiddenImagePreview} 
                          alt="Hidden image preview" 
                          className="w-full max-h-48 object-contain rounded-md border border-cyber-purple/20" 
                        />
                        <div className="absolute top-2 right-2 bg-cyber-purple/90 text-white px-2 py-1 rounded text-xs">
                          Hidden Image
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="space-y-2">
                <Label htmlFor="key">{mode === "text" ? "Encryption Key" : "Access Key"}</Label>
                <Input 
                  id="key" 
                  type="password" 
                  placeholder={mode === "text" ? "Enter strong encryption key" : "Enter access key for hidden image"} 
                  value={key} 
                  onChange={(e) => setKey(e.target.value)}
                  className="border-cyber-blue/20 focus:border-cyber-blue/40"
                />
              </div>

              {mode === "text" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-cyber-blue" />
                      Message Expiry
                    </Label>
                    <Select value={expiresIn.toString()} onValueChange={(v) => setExpiresIn(Number(v))}>
                      <SelectTrigger className="border-cyber-purple/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-cyber-green" />
                      Device Binding
                    </Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="device-bind" 
                        checked={bindToDevice}
                        onCheckedChange={(checked) => setBindToDevice(checked as boolean)}
                      />
                      <Label htmlFor="device-bind" className="text-sm text-muted-foreground">
                        Bind to this device only
                      </Label>
                    </div>
                  </div>
                </div>
              )}
              
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-6 h-6 rounded-full bg-cyber-green text-white text-sm flex items-center justify-center font-medium">3</div>
                    Secure & Encode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button 
                      variant="hero" 
                      type="button" 
                      onClick={onEncode} 
                      disabled={processing || !imageFile || !key || (mode === "text" && !message) || (mode === "image" && !hiddenImageFile)}
                      className="flex-1"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Encoding...
                        </>
                      ) : (
                        <>
                          {mode === "text" ? <Lock className="h-4 w-4 mr-2" /> : <Image className="h-4 w-4 mr-2" />}
                          {mode === "text" ? "Encode & Secure" : "Hide Image"}
                        </>
                      )}
                    </Button>
                  </div>

                  {stegoUrl && (
                    <div className="pt-4 p-4 rounded-lg bg-cyber-green/5 border border-cyber-green/20">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-cyber-green" />
                          <span className="font-medium">Stego Image Ready</span>
                        </div>
                        <a 
                          href={stegoUrl} 
                          download="stego.png"
                          className="text-cyber-green hover:text-cyber-green/80 underline text-sm"
                        >
                          Download stego.png
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="glass-card border-cyber-blue/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyber-blue">
              <QrCode className="h-5 w-5" />
              Encryption Key QR Code
            </DialogTitle>
            <DialogDescription>
              {qrExpired ? (
                <span className="text-red-400 flex items-center gap-2">
                  <EyeOff className="h-4 w-4" />
                  QR code has expired for security
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Share this QR code securely. Expires in {qrCountdown}s
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            {qrExpired ? (
              <div className="w-48 h-48 rounded-lg bg-card/20 border border-red-500/20 flex items-center justify-center">
                <div className="text-center text-red-400">
                  <Lock className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">QR Code Expired</p>
                </div>
              </div>
            ) : (
              <div ref={qrRef} className="p-4 bg-white rounded-lg border-2 border-cyber-blue/20">
                <QRCode 
                  value={key} 
                  size={200} 
                  style={{ height: "auto", maxWidth: "100%", width: "200px" }} 
                />
              </div>
            )}
            
            <div className="flex gap-3">
              {!qrExpired && (
                <Button 
                  variant="outline" 
                  onClick={downloadQR}
                  className="border-cyber-blue/20 hover:bg-cyber-blue/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
              )}
              <Button 
                variant="secondary" 
                onClick={() => setShowQRModal(false)}
              >
                Close
              </Button>
            </div>
            
            {!qrExpired && (
              <div className="text-center text-xs text-muted-foreground">
                <Timer className="h-3 w-3 inline mr-1" />
                Auto-expires in {qrCountdown} seconds
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Encode;
