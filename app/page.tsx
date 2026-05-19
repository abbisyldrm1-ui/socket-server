"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://socket-server-1-d5rs.onrender.com", {
  transports: ["websocket", "polling"],
  reconnection: true,
});

export default function Home() {

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [status, setStatus] = useState("SUNUCUYA BAĞLANIYOR...");
  const [matched, setMatched] = useState(false);

  // SOCKET + CAMERA
  useEffect(() => {

    startCamera();

    socket.on("connect", () => {

      console.log("SOCKET BAGLANDI:", socket.id);

      setStatus("SUNUCUYA BAĞLANDI ✔");

    });

    socket.on("waiting", () => {

      console.log("WAITING");

      setMatched(false);

      setStatus("KULLANICI BEKLENİYOR...");

    });

    socket.on("matched", (data) => {

      console.log("MATCHED:", data);

      setMatched(true);

      setStatus("EŞLEŞTİN 🔥");

    });

    socket.on("disconnect", () => {

      console.log("SOCKET KOPTU");

      setMatched(false);

      setStatus("BAĞLANTI KOPTU");

    });

    return () => {

      socket.off("connect");
      socket.off("waiting");
      socket.off("matched");
      socket.off("disconnect");

    };

  }, []);

  // CAMERA
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

      setStatus("KAMERA AÇILAMADI ❌");

    }

  };

  // FIND MATCH
  const findMatch = () => {

    console.log("MATCH ISTENDI");

    setStatus("EŞLEŞME ARANIYOR...");

    socket.emit("find-match");

  };

  // NEXT
  const nextUser = () => {

    console.log("SONRAKI");

    setMatched(false);

    setStatus("SONRAKI KULLANICI ARANIYOR...");

    socket.emit("next");

  };

  return (

    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-5">

      {/* LOGO */}
      <div className="text-4xl font-bold text-yellow-400 mb-4">
        AURA LIVE
      </div>

      {/* ONLINE */}
      <div className="text-green-400 mb-4">
        1284 ONLINE
      </div>

      {/* VIDEO */}
      <div className="relative">

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-80 h-[500px] rounded-3xl border-2 border-yellow-500 object-cover bg-gray-900"
        />

        {/* STATUS */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-sm">

          {status}

        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 mt-6">

        <button
          onClick={findMatch}
          className="px-6 py-3 bg-yellow-500 text-black rounded-full font-bold"
        >
          EŞLEŞME ARA
        </button>

        {matched && (

          <button
            onClick={nextUser}
            className="px-6 py-3 bg-red-500 rounded-full font-bold"
          >
            SONRAKİ
          </button>

        )}

      </div>

      {/* ALT MENU */}
      <div className="flex gap-5 mt-8 text-sm text-gray-300">

        <button>
          Kamera
        </button>

        <button>
          Mikrofon
        </button>

        <button>
          Profil
        </button>

        <button>
          Arkadaşlar
        </button>

      </div>

    </div>

  );
}