import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageDetection, getCommonLanguages, basicTranslate } from "@/lib/languageDetection";
import { Globe, Languages, Zap } from "lucide-react";

interface LanguageDetectionCardProps {
  detection: LanguageDetection;
  originalMessage: string;
  className?: string;
}

export function LanguageDetectionCard({ detection, originalMessage, className }: LanguageDetectionCardProps) {
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  
  const commonLanguages = getCommonLanguages();

  const handleTranslate = () => {
    if (!selectedTargetLang) return;
    
    const result = basicTranslate(originalMessage, selectedTargetLang);
    setTranslatedText(result);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400";
    if (confidence >= 0.6) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <Card className={`border-cyber-border bg-cyber-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-cyber-text">
          <Globe className="h-5 w-5 text-primary" />
          Language Detection
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Detection Results */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-cyber-text" />
              <span className="text-sm text-cyber-text">Detected Language:</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {detection.languageName}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-cyber-text">Confidence</div>
            <div className={`text-lg font-bold ${getConfidenceColor(detection.confidence)}`}>
              {Math.round(detection.confidence * 100)}%
            </div>
          </div>
        </div>

        {/* Translation Section */}
        {detection.language !== 'eng' && (
          <div className="space-y-3 p-3 rounded-md bg-cyber-accent/10 border border-cyber-accent/20">
            <div className="flex items-center gap-2 text-sm text-cyber-text">
              <Zap className="h-4 w-4" />
              Quick Translation (Basic)
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTargetLang} onValueChange={setSelectedTargetLang}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {commonLanguages
                    .filter(lang => lang.code !== detection.language)
                    .map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleTranslate}
                disabled={!selectedTargetLang}
                size="sm"
                variant="outline"
              >
                Translate
              </Button>
            </div>

            {translatedText && (
              <div className="mt-3 p-2 rounded bg-background/50 border">
                <p className="text-sm text-cyber-text">{translatedText}</p>
              </div>
            )}

            {translatedText === null && selectedTargetLang && (
              <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-400">
                  Basic translation not available for this language pair. Consider using external translation services.
                </p>
              </div>
            )}
          </div>
        )}

        {detection.language === 'eng' && (
          <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-400">Message is already in English</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}