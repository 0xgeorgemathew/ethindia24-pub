"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import type {
  TransactionError,
  TransactionResponse,
} from "@coinbase/onchainkit/transaction";
import type { Address, ContractFunctionParameters } from "viem";
import {
  BASE_SEPOLIA_CHAIN_ID,
  mintABI,
  mintContractAddress,
} from "../constants";
import { Camera } from "lucide-react";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: "ap-south-1",
  credentials: new AWS.Credentials({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  }),
  signatureVersion: "v4",
});

export default function TransactionWrapper({ address }: { address: Address }) {
  const [imageUrl, setImageUrl] = useState("");
  const [adName, setAdName] = useState("");
  const [adText, setAdText] = useState("");
  const [isCapturing, setIsCapturing] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError("");
      console.log("Requesting camera access...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser");
      }

      setIsCapturing(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!videoRef.current) {
        throw new Error("Video element not initialized");
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      console.log("Available video devices:", videoDevices);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: videoDevices[0].deviceId,
          width: { ideal: 1920 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element not available"));
          return;
        }

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(resolve).catch(reject);
        };

        videoRef.current.onerror = (error) => {
          reject(error);
        };
      });
    } catch (err) {
      console.error("Camera initialization error:", err);
      setIsCapturing(false);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to access camera";
      setCameraError(errorMessage);
      alert(`Camera access failed: ${errorMessage}`);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas reference not available");
      return;
    }

    try {
      const context = canvasRef.current.getContext("2d");
      if (!context) {
        console.error("Could not get canvas context");
        return;
      }

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob(
          (blob) => {
            resolve(blob!);
          },
          "image/jpeg",
          0.8
        );
      });

      console.log("Photo captured, size:", blob.size);
      await uploadToS3(blob);

      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCapturing(false);
    } catch (err) {
      console.error("Error capturing photo:", err);
      alert("Failed to capture photo. Please try again.");
    }
  };

  const uploadToS3 = async (blob: Blob) => {
    setIsUploading(true);
    const fileName = `ad-images/${Date.now()}-${adName.replace(/\s+/g, "-").toLowerCase()}.jpg`;

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const params = {
        Bucket: "placeholderads",
        Key: fileName,
        Body: buffer,
        ContentType: "image/jpeg",
      };

      const uploadResult = await s3.upload(params).promise();
      const imageURL = `https://placeholderads.s3.ap-south-1.amazonaws.com/${fileName}`;
      setImageUrl(imageURL);
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const contracts = [
    {
      address: mintContractAddress,
      abi: mintABI,
      functionName: "publishAd",
      args: [imageUrl, adName, adText],
    },
  ] as unknown as ContractFunctionParameters[];

  const handleError = (err: TransactionError) => {
    console.error("Transaction error:", err);
  };

  const handleSuccess = (response: TransactionResponse) => {
    console.log("Transaction successful", response);
    setImageUrl("");
    setAdName("");
    setAdText("");
    startCamera();
  };

  return (
    <div className="flex w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-row w-full gap-4">
        {/* Camera/Image Section */}
        <div className="w-1/2 bg-black rounded-lg overflow-hidden">
          {isCapturing ? (
            <div className="relative w-full h-96">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(1)" }}
              />
              <button
                onClick={capturePhoto}
                className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-lg"
                disabled={isUploading}
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="relative w-full h-96">
              {imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={imageUrl}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={startCamera}
                    className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-lg"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center">
                    <span className="text-sm text-gray-500">
                      {cameraError || "Loading camera..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Form Section */}
        <div className="w-1/2 flex flex-col space-y-4">
          <input
            type="text"
            value={adName}
            onChange={(e) => setAdName(e.target.value)}
            placeholder="Ad Name"
            className="w-full p-2 border rounded-lg"
          />
          <textarea
            value={adText}
            onChange={(e) => setAdText(e.target.value)}
            placeholder="Ad Text"
            className="w-full p-2 border rounded-lg h-24 resize-none"
          />

          <Transaction
            // address={address}
            contracts={contracts}
            className="w-full"
            chainId={BASE_SEPOLIA_CHAIN_ID}
            onError={handleError}
            onSuccess={handleSuccess}
            capabilities={{
              paymasterService: {
                url: process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!,
              },
            }}
          >
            <TransactionButton
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 shadow-lg transform hover:scale-105 transition-transform duration-200"
              text="Publish"
            />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        </div>
      </div>
    </div>
  );
}
