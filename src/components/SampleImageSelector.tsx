import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Check } from "lucide-react";

// Import sample images
import sample1 from "@/assets/sample1-abstract.jpg";
import sample2 from "@/assets/sample2-nature.jpg";
import sample3 from "@/assets/sample3-cityscape.jpg";
import sample4 from "@/assets/sample4-digital.jpg";
import sample5 from "@/assets/sample5-flowers.jpg";
import sample6 from "@/assets/sample6-space.jpg";
import sample7 from "@/assets/sample7-underwater.jpg";

interface SampleImage {
  id: string;
  name: string;
  src: string;
  description: string;
  suitability: "excellent" | "good" | "fair";
}

const sampleImages: SampleImage[] = [
  {
    id: "abstract",
    name: "Abstract Art",
    src: sample1,
    description: "Colorful geometric patterns",
    suitability: "excellent"
  },
  {
    id: "nature",
    name: "Nature Scene",
    src: sample2,
    description: "Forest and water landscape",
    suitability: "excellent"
  },
  {
    id: "cityscape",
    name: "City Skyline",
    src: sample3,
    description: "Urban sunset view",
    suitability: "good"
  },
  {
    id: "digital",
    name: "Digital Art",
    src: sample4,
    description: "Complex fractal patterns",
    suitability: "excellent"
  },
  {
    id: "flowers",
    name: "Macro Flowers",
    src: sample5,
    description: "Detailed floral photography",
    suitability: "good"
  },
  {
    id: "space",
    name: "Cosmic Scene",
    src: sample6,
    description: "Nebula and starfield",
    suitability: "excellent"
  },
  {
    id: "underwater",
    name: "Coral Reef",
    src: sample7,
    description: "Marine life and corals",
    suitability: "good"
  }
];

interface SampleImageSelectorProps {
  selectedImageId?: string;
  onImageSelect: (imageFile: File, imageId: string) => void;
}

export function SampleImageSelector({ selectedImageId, onImageSelect }: SampleImageSelectorProps) {
  const handleImageSelect = async (sampleImage: SampleImage) => {
    try {
      // Fetch the image and convert to File object
      const response = await fetch(sampleImage.src);
      const blob = await response.blob();
      const file = new File([blob], `${sampleImage.id}.jpg`, { type: 'image/jpeg' });
      onImageSelect(file, sampleImage.id);
    } catch (error) {
      console.error('Failed to load sample image:', error);
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "excellent": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "good": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "fair": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Sample Images
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose from optimized images perfect for steganography
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sampleImages.map((image) => (
            <div key={image.id} className="relative">
              <Button
                variant="ghost"
                className={`h-auto p-2 w-full flex flex-col gap-2 hover:bg-primary/10 ${
                  selectedImageId === image.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => handleImageSelect(image)}
              >
                <div className="relative">
                  <img
                    src={image.src}
                    alt={image.description}
                    className="w-full h-16 object-cover rounded"
                  />
                  {selectedImageId === image.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-center space-y-1">
                  <div className="font-medium">{image.name}</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1 py-0 ${getSuitabilityColor(image.suitability)}`}
                  >
                    {image.suitability}
                  </Badge>
                </div>
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>These images are optimized for steganography with good color variance and detail.</p>
        </div>
      </CardContent>
    </Card>
  );
}