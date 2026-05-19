"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://socket-server-1-d5rs.onrender.com");

export default function Home() {

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [status, setStatus] = useState("EŞLEŞME BEKLENİYOR...");
  const [matched, setMatched] = useState(false);

  useEffect(() => {

    startCamera();

    socket.on("waiting", () => {
      setStatus("KULLANICI BEKLENİYOR...");
    });

    socket.on("matched", () => {
      setMatched(true);
      setStatus("EŞLEŞTİN 🔥");
    });

    return () => {
      socket.off("waiting");
      socket.off("matched");
    };

  }, []);

  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

    } catch (err) {

      console.log(err);

      setStatus("KAMERA AÇILAMADI");

    }

  };

  const findMatch = () => {

    setStatus("EŞLEŞME ARANIYOR...");

    socket.emit("find-match");

  };

  return (

    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-5">

      <h1 className="text-4xl font-bold text-yellow-400">
        AURA LIVE
      </h1>

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="w-80 h-96 rounded-2xl border-2 border-yellow-500 object-cover"
      />

      <div className="text-lg font-semibold">
        {status}
      </div>

      <button
        onClick={findMatch}
        className="px-6 py-3 bg-yellow-500 text-black rounded-full font-bold"
      >
        EŞLEŞME ARA
      </button>

      {matched && (

        <button
          className="px-6 py-3 bg-red-500 rounded-full font-bold"
        >
          SONRAKİ
        </button>

      )}

    </div>

  );
}