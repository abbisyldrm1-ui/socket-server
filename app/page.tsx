"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log(err);
      }
    }

    startCamera();
  }, []);

  const toggleMic = () => {
    const stream = videoRef.current?.srcObject as MediaStream;

    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !mic;
      });
    }

    setMic(!mic);
  };

  const toggleCam = () => {
    const stream = videoRef.current?.srcObject as MediaStream;

    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !cam;
      });
    }

    setCam(!cam);
  };

  return (
    <main className="app">
      <div className="phone">
        <div className="topBar">
          <div className="logoArea">
            <div className="diamond">💎</div>

            <div>
              <h1>AURA</h1>
              <span>LIVE</span>
            </div>
          </div>

          <div className="onlineBox">
            <div className="dot"></div>
            1284
          </div>
        </div>

        <div className="cameraBox">
          <video ref={videoRef} autoPlay playsInline muted />
        </div>

        <div className="centerContent">
          <div className="loadingDots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <h2>
            EŞLEŞME
            <br />
            BEKLENİYOR
          </h2>

          <p>Sana uygun kullanıcı aranıyor</p>

          <button className="matchBtn">
            ✨
            <span>EŞLEŞME ARA</span>
          </button>
        </div>

        <div className="friendWrap">
          <button className="friendBtn">
            👤 Arkadaş Ekle
          </button>

          <button className="nextBtn">
            🔥 SONRAKİ
          </button>
        </div>

        <div className="controlArea">
          <button className="circleBtn" onClick={toggleMic}>
            {mic ? "🎤" : "🔇"}
          </button>

          <button className="circleBtn" onClick={toggleCam}>
            {cam ? "📷" : "🚫"}
          </button>
        </div>

        <div className="navbar">
          <button className="active">
            🏠
            <span>Ana Sayfa</span>
          </button>

          <button>
            👑
            <span>Premium</span>
          </button>

          <button>
            💬
            <span>Mesajlar</span>
          </button>

          <button>
            👤
            <span>Profil</span>
          </button>
        </div>
      </div>
    </main>
  );
}