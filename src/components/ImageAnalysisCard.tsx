import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ImageAnalysis } from "@/lib/imageAnalysis";
import { Shield, Eye, Zap, Gauge } from "lucide-react";

interface ImageAnalysisCardProps {
  analysis: ImageAnalysis;
  className?: string;
}

export function ImageAnalysisCard({ analysis, className }: ImageAnalysisCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <Card className={`border-cyber-border bg-cyber-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-cyber-text">
          <Shield className="h-5 w-5 text-primary" />
          Image Suitability Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}/100
          </div>
          <Badge variant={analysis.score >= 60 ? "default" : "destructive"}>
            {getScoreLabel(analysis.score)}
          </Badge>
        </div>

        {/* Factors Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-cyber-text">
              <Gauge className="h-4 w-4" />
              Resolution: {analysis.factors.resolution}%
            </div>
            <Progress value={analysis.factors.resolution} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-cyber-text">
              <Eye className="h-4 w-4" />
              Color Variance: {analysis.factors.colorVariance}%
            </div>
            <Progress value={analysis.factors.colorVariance} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-cyber-text">
              <Zap className="h-4 w-4" />
              Noise Level: {analysis.factors.noiseLevel}%
            </div>
            <Progress value={analysis.factors.noiseLevel} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-cyber-text">
              <Shield className="h-4 w-4" />
              Aspect Ratio: {analysis.factors.aspectRatio}%
            </div>
            <Progress value={analysis.factors.aspectRatio} className="h-2" />
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-3 rounded-md bg-cyber-accent/10 border border-cyber-accent/20">
          <p className="text-sm text-cyber-text">{analysis.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}