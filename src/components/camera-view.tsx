"use client";

import { generateSceneDescription } from "@/ai/flows/describe-scene";
import { speak } from "@/lib/tts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Pause, Play } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisRunningRef = useRef(false);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // User-controlled pause for the whole system
  const [isProcessing, setIsProcessing] = useState(false); // True during AI call + TTS
  const [sceneDescription, setSceneDescription] = useState("");
  const [error, setError] = useState<string | null>(
    "Requesting camera permissions..."
  );

  const { toast } = useToast();

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
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast]);

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
  
  // This effect manages the analysis interval.
  useEffect(() => {
    if (!isCameraReady || isPaused) {
      return;
    }

    const runAnalysis = async () => {
      if (analysisRunningRef.current) {
        return; // An analysis is already in progress
      }
      analysisRunningRef.current = true;
      setIsProcessing(true);
      
      const photoDataUri = captureFrame();

      if (!photoDataUri) {
        toast({ title: "Error", description: "Could not capture frame.", variant: "destructive" });
        analysisRunningRef.current = false;
        setIsProcessing(false);
        return;
      }
      
      try {
        const result = await generateSceneDescription({ photoDataUri });
        const description = result.sceneDescription;
        setSceneDescription(description);
        await speak(description);
      } catch (e) {
        console.error("AI Error:", e);
        toast({ title: "AI Error", description: "Failed to generate description.", variant: "destructive" });
      } finally {
        analysisRunningRef.current = false;
        setIsProcessing(false);
      }
    };

    // Run once immediately when not paused
    runAnalysis(); 
    
    const intervalId = setInterval(runAnalysis, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCameraReady, isPaused, captureFrame, toast]);

  const togglePause = () => {
    setIsPaused(current => {
      const isNowPaused = !current;
      if (isNowPaused) {
        setSceneDescription("");
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        setIsProcessing(false);
        analysisRunningRef.current = false;
      }
      return isNowPaused;
    });
  };
  
  const handleSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
     if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        const wasVideoPlaying = !video.paused;
        if (wasVideoPlaying) video.pause();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const link = document.createElement("a");
        link.download = "sightspeak-snapshot.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast({ title: "Snapshot saved!" });
        
        if (wasVideoPlaying) video.play();
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

      {(isProcessing && !sceneDescription) && (
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
            onClick={togglePause}
            size="icon"
            className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label={isPaused ? "Start Analysis" : "Stop Analysis"}
            disabled={!isCameraReady}
          >
            {isPaused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
          </Button>

          <Button
            onClick={handleSnapshot}
            size="icon"
            className="w-12 h-12 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground"
            aria-label="Take Snapshot"
            disabled={!isCameraReady || isProcessing}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
