import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, MessageSquare, Trash2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  content: string;
}

interface MessageTemplatesProps {
  onTemplateSelect: (content: string) => void;
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Meeting Reminder",
    content: "Don't forget about our meeting tomorrow at 2 PM. Location: Conference Room A."
  },
  {
    id: "2",
    name: "Secret Location",
    content: "The treasure is buried 10 steps north from the old oak tree."
  },
  {
    id: "3",
    name: "Password Share",
    content: "Your temporary access code is: TMP2024X7Y9"
  },
  {
    id: "4",
    name: "Event Details",
    content: "Party tonight at 8 PM. Address: 123 Secret Street. Bring snacks!"
  }
];

export const MessageTemplates = ({ onTemplateSelect }: MessageTemplatesProps) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem('stegx-templates');
    return saved ? JSON.parse(saved) : defaultTemplates;
  });
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('stegx-templates', JSON.stringify(newTemplates));
  };

  const addTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      toast({ description: "Please fill in both template name and content", variant: "destructive" });
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: newTemplateContent
    };

    saveTemplates([...templates, newTemplate]);
    setNewTemplateName("");
    setNewTemplateContent("");
    setShowNewTemplate(false);
    toast({ description: "Template saved successfully!" });
  };

  const deleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
    toast({ description: "Template deleted" });
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ description: "Template copied to clipboard!" });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Quick Templates
        </CardTitle>
        <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Save frequently used messages as templates for quick access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Meeting Reminder"
                />
              </div>
              <div>
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  placeholder="Enter your template message..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                  Cancel
                </Button>
                <Button onClick={addTemplate}>
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{template.name}</h4>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(template.content)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {template.content}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTemplateSelect(template.content)}
                className="w-full"
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>
        {templates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No templates yet. Create your first template!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};