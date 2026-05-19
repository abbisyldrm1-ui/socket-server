"use client";

import "./globals.css";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

import Peer from "peerjs";

const socket =
  io("http://localhost:3001");

export default function Home() {

  const localVideoRef =
    useRef<HTMLVideoElement>(null);

  const remoteVideoRef =
    useRef<HTMLVideoElement>(null);

  const peerRef = useRef<any>(null);

  const currentCall =
    useRef<any>(null);

  const localStream =
    useRef<MediaStream | null>(null);

  const [matched, setMatched] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [mic, setMic] =
    useState(true);

  const [cam, setCam] =
    useState(true);

  useEffect(() => {

    async function startCamera() {

      try {

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        localStream.current =
          stream;

        if (localVideoRef.current) {

          localVideoRef.current.srcObject =
            stream;

        }

      } catch (err) {
        console.log(err);
      }
    }

    startCamera();

  }, []);

  useEffect(() => {

    const peer =
      new Peer();

    peerRef.current = peer;

    peer.on("open", (id) => {

      console.log("PEER:", id);

      socket.emit("peer-id", id);

    });

    peer.on("call", (call) => {

      if (!localStream.current)
        return;

      call.answer(localStream.current);

      call.on("stream", (remote) => {

        if (remoteVideoRef.current) {

          remoteVideoRef.current.srcObject =
            remote;

        }

      });

      currentCall.current = call;

    });

  }, []);

  useEffect(() => {

    socket.on("waiting", () => {

      setSearching(true);

      setMatched(false);

    });

    socket.on("matched", ({
      peerId,
    }) => {

      setSearching(false);

      setMatched(true);

      if (
        peerId &&
        peerRef.current &&
        localStream.current
      ) {

        const call =
          peerRef.current.call(
            peerId,
            localStream.current
          );

        call.on("stream", (remote) => {

          if (remoteVideoRef.current) {

            remoteVideoRef.current.srcObject =
              remote;

          }

        });

        currentCall.current = call;

      }

    });

  }, []);

  const toggleMic = () => {

    const stream =
      localStream.current;

    if (stream) {

      stream
        .getAudioTracks()
        .forEach((track) => {

          track.enabled = !mic;

        });

    }

    setMic(!mic);
  };

  const toggleCam = () => {

    const stream =
      localStream.current;

    if (stream) {

      stream
        .getVideoTracks()
        .forEach((track) => {

          track.enabled = !cam;

        });

    }

    setCam(!cam);
  };

  const findMatch = () => {

    socket.emit("find-match");

  };

  const nextUser = () => {

    currentCall.current?.close();

    socket.emit("next");

    setMatched(false);

    setSearching(true);

  };

  return (

    <main className="app">

      <section className="phone">

        <div className="topBar">

          <div className="logoWrap">

            <div className="diamond">
              💎
            </div>

            <div>
              <h1>AURA</h1>
              <p>LIVE</p>
            </div>

          </div>

          <div className="onlineBox">

            <div className="onlineDot"></div>

            1284

          </div>

        </div>

        <div className="cameraBox">

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
          />

        </div>

        {matched && (

          <div className="remoteBox">

            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />

          </div>

        )}

        <div className="centerArea">

          {!matched && (
            <>
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <h2>
                EŞLEŞME
                <br />
                {searching
                  ? "ARANIYOR"
                  : "BEKLENİYOR"}
              </h2>

              <p>
                {searching
                  ? "Kullanıcı aranıyor..."
                  : "Eşleşme başlat"}
              </p>
            </>
          )}

          {matched && (
            <>
              <div className="matchedIcon">
                ✓
              </div>

              <h2 className="green">
                EŞLEŞME
                <br />
                BAĞLANDI
              </h2>

              <p>
                Görüntülü sohbet aktif 🎉
              </p>
            </>
          )}

          {!searching && !matched && (

            <button
              className="matchBtn"
              onClick={findMatch}
            >

              ✨

              <span>
                EŞLEŞME ARA
              </span>

            </button>

          )}

          {searching && !matched && (

            <button className="matchBtn waiting">

              ⏳

              <span>
                ARANIYOR
              </span>

            </button>

          )}

        </div>

        <div className="leftButtons">

          <button
            className="miniBtn"
            onClick={toggleMic}
          >
            {mic ? "🎤" : "🔇"}
          </button>

          <button
            className="miniBtn"
            onClick={toggleCam}
          >
            {cam ? "📷" : "🚫"}
          </button>

        </div>

        {matched && (

          <div className="rightButtons">

            <button className="friendBtn">
              ➕
            </button>

            <button
              className="nextBtn"
              onClick={nextUser}
            >
              🔥 GEÇ
            </button>

          </div>

        )}

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

      </section>

    </main>
  );
}