"use client";

import { generateSceneDescription } from "@/ai/flows/describe-scene";
import { enhanceSceneDescription } from "@/ai/flows/enhance-scene-description";
import { detectObjects, type DetectedObject } from "@/lib/object-detection";
import { speak } from "@/lib/tts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ObjectOverlay } from "@/components/object-overlay";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Pause, Play, Sparkles, Wand2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectDetectionIntervalRef = useRef<NodeJS.Timeout>();

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sceneDescription, setSceneDescription] = useState("");
  const [canEnhance, setCanEnhance] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [error, setError] = useState<string | null>(
    "Requesting camera permissions..."
  );

  const { toast } = useToast();

  const startObjectDetection = useCallback(() => {
    if (objectDetectionIntervalRef.current) {
      clearInterval(objectDetectionIntervalRef.current);
    }
    objectDetectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const objects = await detectObjects();
        setDetectedObjects(objects);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setIsCameraReady(true);
              setError(null);
              startObjectDetection();
            };
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError(
            "Camera access denied. Please enable camera permissions in your browser settings."
          );
          toast({
            title: "Camera Error",
            description: "Could not access the camera. Please check permissions.",
            variant: "destructive",
          });
        }
      } else {
        setError("Your browser does not support camera access.");
      }
    }

    setupCamera();

    return () => {
      if (objectDetectionIntervalRef.current) {
        clearInterval(objectDetectionIntervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast, startObjectDetection]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return canvas.toDataURL("image/jpeg");
      }
    }
    return null;
  }, []);

  const handleDescribeScene = useCallback(
    async (enhance = false) => {
      setIsLoading(true);
      setCanEnhance(false);
      const photoDataUri = captureFrame();

      if (!photoDataUri) {
        toast({ title: "Error", description: "Could not capture frame.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      const objectsForDescription = await detectObjects();
      setDetectedObjects(objectsForDescription);

      try {
        let description = "";
        if (enhance) {
          const result = await enhanceSceneDescription({
            photoDataUri,
            detectedObjects: objectsForDescription.map(o => o.label),
            previousDescription: sceneDescription,
          });
          description = result.enhancedDescription;
        } else {
          const result = await generateSceneDescription({
            photoDataUri,
            detectedObjects: objectsForDescription.map(o => o.label),
          });
          description = result.sceneDescription;
        }
        setSceneDescription(description);
        speak(description);
        setCanEnhance(true);
      } catch (e) {
        console.error("AI Error:", e);
        toast({ title: "AI Error", description: "Failed to generate description.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    },
    [captureFrame, sceneDescription, toast]
  );

  const togglePause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
        startObjectDetection();
      } else {
        videoRef.current.pause();
        setIsPaused(true);
        if (objectDetectionIntervalRef.current) {
          clearInterval(objectDetectionIntervalRef.current);
        }
      }
    }
  };

  const handleSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
     if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        detectedObjects.forEach(obj => {
          context.strokeStyle = "#FFEB3B";
          context.lineWidth = 4;
          context.beginPath();
          context.rect(obj.box[0] * canvas.width, obj.box[1] * canvas.height, obj.box[2] * canvas.width, obj.box[3] * canvas.height);
          context.stroke();
          
          context.fillStyle = "#FFEB3B";
          context.font = "18px 'PT Sans', sans-serif";
          context.textBaseline = "top";
          const text = `${obj.label} (${(obj.confidence * 100).toFixed(0)}%)`;
          const textMetrics = context.measureText(text);
          context.fillRect(obj.box[0] * canvas.width, obj.box[1] * canvas.height, textMetrics.width + 8, 28);
          context.fillStyle = "#000";
          context.fillText(text, obj.box[0] * canvas.width + 4, obj.box[1] * canvas.height + 4);
        });

        const link = document.createElement("a");
        link.download = "sightspeak-snapshot.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast({ title: "Snapshot saved!" });
      }
    }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        autoPlay
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {!isCameraReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <Spinner className="h-10 w-10 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      )}

      {isCameraReady && <ObjectOverlay objects={detectedObjects} />}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Spinner className="h-16 w-16 text-accent" />
        </div>
      )}

      {sceneDescription && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-black/50 text-white text-center text-lg font-semibold backdrop-blur-sm">
          <p>{sceneDescription}</p>
        </div>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
        <div className="flex justify-center items-center space-x-2 p-2 rounded-full bg-primary/80 backdrop-blur-md shadow-2xl">
          <Button
            onClick={() => handleDescribeScene(false)}
            size="icon"
            className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Describe Scene"
            disabled={isLoading || !isCameraReady}
          >
            <Sparkles className="h-8 w-8" />
          </Button>

          {canEnhance && (
             <Button
                onClick={() => handleDescribeScene(true)}
                size="icon"
                className="w-12 h-12 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground"
                aria-label="Enhance Description"
                disabled={isLoading}
              >
                <Wand2 className="h-6 w-6" />
              </Button>
          )}

          <Button
            onClick={togglePause}
            size="icon"
            className="w-12 h-12 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground"
            aria-label={isPaused ? "Resume" : "Pause"}
            disabled={!isCameraReady}
          >
            {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </Button>

          <Button
            onClick={handleSnapshot}
            size="icon"
            className="w-12 h-12 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground"
            aria-label="Take Snapshot"
            disabled={!isCameraReady}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
