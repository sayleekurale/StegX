import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { extractStego, extractImageStego } from "@/lib/stego";
import { decryptMessage } from "@/lib/crypto";
import { decompressMessage } from "@/lib/compression";
import { detectLanguage } from "@/lib/languageDetection";
import { AutoCleanupDialog } from "@/components/AutoCleanupDialog";
import { LanguageDetectionCard } from "@/components/LanguageDetectionCard";
import { Scanner } from "@yudiel/react-qr-scanner";
import jsQR from "jsqr";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { Unlock, Loader2, QrCode, Save, Download, MessageSquare, Image, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Decode = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [key, setKey] = useState("");
  const [mode, setMode] = useState<"text" | "image">("text");
  const [result, setResult] = useState<string | null>(null);
  const [extractedImageUrl, setExtractedImageUrl] = useState<string | null>(null);
  const [extractedImageType, setExtractedImageType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showAutoCleanup, setShowAutoCleanup] = useState(false);
  const [languageDetection, setLanguageDetection] = useState<any>(null);
  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  const qrFileRef = useRef<HTMLInputElement>(null);

  function readQRFromFile(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const res = jsQR(data, width, height);
          resolve(res?.data ?? null);
        } catch {
          resolve(null);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  const pickQRImage = () => qrFileRef.current?.click();
  const onQRFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readQRFromFile(file);
      if (data) {
        setKey(data);
        toast({ title: "Key detected from image" });
      } else {
        toast({ title: "No QR code found in image" });
      }
    } catch (error) {
      toast({ title: "Failed to read QR code", variant: "destructive" });
    }
    // Clear the input value safely
    if (e.target) {
      e.target.value = "";
    }
  };

  async function onDecode() {
    if (!imageFile || !key) {
      toast({ title: "Select image and enter key" });
      return;
    }
    
    try {
      setResult(null);
      setExtractedImageUrl(null);
      setError(null);
      
      if (mode === "text") {
        const encrypted = await extractStego(imageFile);
        let message = await decryptMessage(encrypted, key);
        
        // Check if message was compressed
        try {
          const parsed = JSON.parse(message);
          if (parsed.compressed && parsed.data) {
            const compressedData = new Uint8Array(parsed.data);
            message = decompressMessage(compressedData);
            
            toast({
              title: "Message Decompressed",
              description: "Compressed message successfully restored",
            });
          }
        } catch {
          // Not compressed, use as-is
        }
        
        // Detect language
        const detection = detectLanguage(message);
        setLanguageDetection(detection);
        
        setResult(message);
        
        // Add to history
        if ((window as any).addToStegxHistory) {
          (window as any).addToStegxHistory({
            type: 'decode',
            mode: 'text',
            fileName: imageFile.name,
            size: imageFile.size,
            result: message.substring(0, 100) + (message.length > 100 ? '...' : '')
          });
        }
        
        // Start auto-cleanup countdown
        setShowAutoCleanup(true);
        
        toast({ 
          title: "Message decoded successfully!", 
          description: `Message decoded in ${detection.languageName}. Auto-cleanup started.`
        });
      } else {
        // Image mode
        const { blob, type } = await extractImageStego(imageFile);
        const url = URL.createObjectURL(blob);
        setExtractedImageUrl(url);
        setExtractedImageType(type);
        
        // Add to history
        if ((window as any).addToStegxHistory) {
          (window as any).addToStegxHistory({
            type: 'decode',
            mode: 'image',
            fileName: imageFile.name,
            size: imageFile.size,
            imageUrl: url
          });
        }
        
        setOpen(true);
        
        toast({ 
          title: "Hidden image extracted!", 
          description: `Image type: ${type.toUpperCase()}`
        });
      }
    } catch (e: any) {
      console.error(e);
      let errorMessage = mode === "text" 
        ? "Decryption failed. Wrong key or not a stego image."
        : "Extraction failed. Wrong key or no hidden image found.";
      
      if (e?.message?.includes("expired")) {
        errorMessage = "This message has expired and can no longer be decoded.";
      } else if (e?.message?.includes("already been decoded")) {
        errorMessage = "This message has already been decoded once and is now locked.";
      } else if (e?.message?.includes("different device")) {
        errorMessage = "This message is bound to a different device.";
      }
      
      setError(errorMessage);
      setOpen(true);
    }
  }

  return (
    <main className="min-h-screen app-surface animate-fade-in">
      <Helmet>
        <title>Decode – Image Steganography</title>
        <meta name="description" content="Select a stego image, enter or scan a key, and reveal the hidden encrypted message." />
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
              <h1 className="text-xl md:text-2xl font-bold">Decode Message</h1>
              <p className="text-sm md:text-base text-muted-foreground">Extract hidden content from steganographic images</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mb-6 md:mb-8 px-4">
        <div className="flex items-center justify-center space-x-4 md:space-x-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-medium ${
              imageFile ? 'bg-cyber-blue text-white' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm md:text-base font-medium">Upload Image</span>
          </div>
          <div className="h-px flex-1 bg-border max-w-16 md:max-w-24"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-medium ${
              key ? 'bg-cyber-blue text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm md:text-base font-medium">Enter Key</span>
          </div>
          <div className="h-px flex-1 bg-border max-w-16 md:max-w-24"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-medium ${
              result || extractedImageUrl ? 'bg-cyber-green text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm md:text-base font-medium">Reveal Secret</span>
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
                  Stego Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} aria-label="Select stego image" />
                {previewUrl && (
                  <div className="relative">
                    <img src={previewUrl} alt="Selected stego image preview" className="w-full rounded-md border border-border" />
                    <div className="absolute top-2 right-2 bg-cyber-purple/90 text-white px-2 py-1 rounded text-xs">
                      Stego Image
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="order-2 lg:order-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyber-purple text-white text-sm flex items-center justify-center font-medium">2</div>
                  Decode Mode & Key
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
                </Tabs>
                <div className="space-y-2">
                  <Label htmlFor="key">{mode === "text" ? "Decryption Key" : "Access Key"}</Label>
                  <Input 
                    id="key" 
                    type="password" 
                    placeholder={mode === "text" ? "Enter decryption key" : "Enter access key"} 
                    value={key} 
                    onChange={(e) => setKey(e.target.value)} 
                    className="border-cyber-blue/20 focus:border-cyber-blue/40"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input ref={qrFileRef} type="file" accept="image/*" onChange={onQRFileChange} className="hidden" aria-label="Upload QR image" />
                  <Button variant="outline" type="button" onClick={pickQRImage} className="flex-1 sm:flex-none">
                    <QrCode className="h-4 w-4 mr-2" />
                    Upload QR
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button" className="flex-1 sm:flex-none">
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan QR
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Scan Key QR</DialogTitle>
                        <DialogDescription>Point the camera at the QR code of your key.</DialogDescription>
                      </DialogHeader>
                      <div className="rounded-md overflow-hidden">
                        <Scanner
                          onScan={(detectedCodes) => {
                            if (detectedCodes && detectedCodes.length > 0) {
                              const scannedValue = detectedCodes[0].rawValue;
                              setKey(scannedValue);
                              setOpen(false);
                              toast({
                                title: "QR Code Scanned",
                                description: "Key has been extracted from QR code.",
                              });
                            }
                          }}
                          onError={(error) => {
                            console.error("QR scan error:", error);
                            toast({
                              title: "QR Scan Error",
                              description: "Unable to access camera or scan QR code.",
                              variant: "destructive",
                            });
                          }}
                          constraints={{
                            facingMode: "environment"
                          }}
                          styles={{
                            container: { width: "100%" },
                            video: { width: "100%" }
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyber-green text-white text-sm flex items-center justify-center font-medium">3</div>
                  Reveal Secret
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="hero" 
                  type="button" 
                  onClick={onDecode} 
                  disabled={!imageFile || !key}
                  className="w-full"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  {mode === "text" ? "Decode Message" : "Extract Image"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Auto-Cleanup Dialog */}
      {result && !error && (
        <AutoCleanupDialog
          open={showAutoCleanup}
          onOpenChange={setShowAutoCleanup}
          message={result}
          onSave={() => {
            // Save to clipboard or download
            navigator.clipboard.writeText(result).then(() => {
              toast({
                title: "Message Saved",
                description: "Message copied to clipboard",
              });
            }).catch(async () => {
              // Fallback: save to device
              try {
                if (Capacitor.isNativePlatform()) {
                  const fileName = `decoded_message_${Date.now()}.txt`;
                  const fileResult = await Filesystem.writeFile({
                    path: fileName,
                    data: btoa(unescape(encodeURIComponent(result))),
                    directory: Directory.Documents
                  });
                  
                  await Share.share({
                    title: 'Decoded Message',
                    text: 'Your decoded message',
                    url: fileResult.uri,
                    dialogTitle: 'Save Message'
                  });
                  
                  toast({
                    title: "Message Saved",
                    description: "Message saved to Documents folder"
                  });
                } else {
                  // Web fallback
                  const blob = new Blob([result], { type: 'text/plain' });
                  const downloadUrl = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = downloadUrl;
                  a.download = `decoded_message_${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(downloadUrl);
                }
              } catch (error) {
                console.error('Save failed:', error);
                toast({
                  title: "Save Failed",
                  description: "Could not save message",
                  variant: "destructive"
                });
              }
            });
          }}
        />
      )}

      {/* Results Dialog (Fallback) */}
      <Dialog open={open && !showAutoCleanup} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {error ? "Error" : mode === "text" ? "Decoded Message" : "Extracted Image"}
            </DialogTitle>
            <DialogDescription>
              {error ? error : (
                <div className="space-y-4 mt-4">
                  {mode === "text" && result ? (
                    <>
                      <Card>
                        <CardContent className="pt-4">
                          <p className="whitespace-pre-wrap break-words">{result}</p>
                        </CardContent>
                      </Card>

                      {/* Language Detection */}
                      {languageDetection && (
                        <LanguageDetectionCard
                          detection={languageDetection}
                          originalMessage={result}
                        />
                      )}

                      {/* Text Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(result);
                            toast({ title: "Copied to clipboard" });
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              if (Capacitor.isNativePlatform()) {
                                const fileName = `decoded_message_${Date.now()}.txt`;
                                const fileResult = await Filesystem.writeFile({
                                  path: fileName,
                                  data: btoa(unescape(encodeURIComponent(result))),
                                  directory: Directory.Documents
                                });
                                
                                await Share.share({
                                  title: 'Decoded Message',
                                  text: 'Your decoded message',
                                  url: fileResult.uri,
                                  dialogTitle: 'Save Message'
                                });
                                
                                toast({
                                  title: "Message Saved",
                                  description: "Message saved to Documents folder"
                                });
                              } else {
                                const blob = new Blob([result], { type: 'text/plain' });
                                const downloadUrl = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = downloadUrl;
                                a.download = `decoded_message_${Date.now()}.txt`;
                                a.click();
                                URL.revokeObjectURL(downloadUrl);
                              }
                            } catch (error) {
                              console.error('Download failed:', error);
                              toast({
                                title: "Download Failed",
                                description: "Could not download message",
                                variant: "destructive"
                              });
                            }
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </>
                  ) : mode === "image" && extractedImageUrl ? (
                    <>
                      <Card>
                        <CardContent className="pt-4">
                          <img 
                            src={extractedImageUrl} 
                            alt="Extracted hidden image" 
                            className="w-full max-h-96 object-contain rounded-md"
                          />
                        </CardContent>
                      </Card>

                      {/* Image Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            try {
                              if (Capacitor.isNativePlatform()) {
                                // Convert blob URL to base64 for mobile save
                                const response = await fetch(extractedImageUrl);
                                const blob = await response.blob();
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  try {
                                    const base64Data = (reader.result as string).split(',')[1];
                                    const fileName = `extracted_image_${Date.now()}.${extractedImageType}`;
                                    
                                    const fileResult = await Filesystem.writeFile({
                                      path: fileName,
                                      data: base64Data,
                                      directory: Directory.Documents
                                    });
                                    
                                    await Share.share({
                                      title: 'Extracted Image',
                                      text: 'Your extracted hidden image',
                                      url: fileResult.uri,
                                      dialogTitle: 'Save Image'
                                    });
                                    
                                    toast({
                                      title: "Image Saved",
                                      description: "Image saved to Documents folder"
                                    });
                                  } catch (error) {
                                    console.error('Save failed:', error);
                                    toast({
                                      title: "Save Failed",
                                      description: "Could not save image",
                                      variant: "destructive"
                                    });
                                  }
                                };
                                reader.readAsDataURL(blob);
                              } else {
                                const a = document.createElement('a');
                                a.href = extractedImageUrl;
                                a.download = `extracted_image_${Date.now()}.${extractedImageType}`;
                                a.click();
                              }
                            } catch (error) {
                              console.error('Download failed:', error);
                              toast({
                                title: "Download Failed",
                                description: "Could not download image",
                                variant: "destructive"
                              });
                            }
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Image
                        </Button>
                        <Button
                          onClick={() => {
                            window.open(extractedImageUrl, '_blank');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          <Image className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Decode;
