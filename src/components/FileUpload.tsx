import { useState, useCallback } from "react";
import { Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "./TaskInput";

interface FileUploadProps {
  onTasksExtracted: (tasks: Task[]) => void;
}

export const FileUpload = ({ onTasksExtracted }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    console.log('Processing file:', file.name, file.type);

    try {
      let content = "";
      let fileType = file.type;

      // Handle different file types
      if (file.type.startsWith('image/')) {
        // For images, convert to base64
        const base64 = await fileToBase64(file);
        content = base64;
        fileType = 'image';
      } else if (file.type === 'application/pdf') {
        toast.info("PDF parsing coming soon! For now, try copying text from the PDF.");
        setIsProcessing(false);
        return;
      } else {
        // Text files
        content = await file.text();
        fileType = 'text';
      }

      // Call edge function to parse tasks
      const { data, error } = await supabase.functions.invoke('parse-tasks', {
        body: { content, fileType }
      });

      if (error) throw error;

      const extractedTasks: Task[] = (data.tasks || []).map((task: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: task.title,
        duration: task.duration || 30,
        priority: task.priority || 'medium',
      }));

      if (extractedTasks.length > 0) {
        onTasksExtracted(extractedTasks);
        toast.success(`Extracted ${extractedTasks.length} tasks from ${file.name}!`);
      } else {
        toast.error("No tasks found in file");
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error("Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medium)]">
      <h3 className="font-semibold text-lg mb-4">Upload File</h3>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all",
          isDragging && "border-accent bg-accent/10",
          !isDragging && "border-border hover:border-accent/50",
          isProcessing && "opacity-50 pointer-events-none"
        )}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Processing file...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-4 mb-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <FileText className="h-12 w-12 text-muted-foreground" />
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports: Text files, Screenshots, Images, PDFs
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept="image/*,.txt,.md,.pdf"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Upload screenshots of your notes, todo lists, or any text file. 
          AI will automatically extract tasks with estimated times and priorities!
        </p>
      </div>
    </Card>
  );
};
