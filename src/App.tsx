import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";

const App = () => {
  const [peerId, setPeerId] = useState<string>("");
  const [peer, setPeer] = useState<Peer>({} as Peer);
  const [remotePeerId, setRemotePeerId] = useState<string>("");

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const peer = new Peer();
    setPeer(peer);

    peer.on("open", (id: string) => {
      console.log(`My id is ${id}`);
      setPeerId(id);
    });

    peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ audio: false, video: true })
        .then((mediaStream: MediaStream) => {
          if (currentVideoRef.current) {
            currentVideoRef.current.srcObject = mediaStream;
          }

          call.answer(mediaStream);
          call.on("stream", (remoteStream: MediaStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        })
        .catch(console.error);
    });
  }, []);

  const call = (remotePeerId: string) => {
    const getUserMedia = navigator.mediaDevices.getUserMedia;

    if (getUserMedia) {
      getUserMedia({ audio: false, video: true })
        .then((mediaStream: MediaStream) => {
          const call = peer.call(remotePeerId, mediaStream);

          if (currentVideoRef.current) {
            currentVideoRef.current.srcObject = mediaStream;
          }

          call.on("stream", (remoteStream: MediaStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        })
        .catch((error) => {
          console.error("Error getting user media:", error);
        });
    } else {
      console.error("getUserMedia is not supported in this browser");
    }
  };

  return (
    <div>
      <div>My PEER ID - {peerId}</div>
      <input
        type="text"
        value={remotePeerId}
        onChange={(e) => setRemotePeerId(e.target.value)}
        className="border border-red-500"
      />{" "}
      <button
        onClick={() => call(remotePeerId)}
        className="bg-green-500 text-white rounded px-4 py-2"
      >
        Call
      </button>
      <h2 className="text-2xl">My Video</h2>
      <video ref={currentVideoRef} autoPlay autoFocus></video>
      <h2 className="text-2xl">Remote Video</h2>
      <video ref={remoteVideoRef} autoPlay autoFocus></video>
    </div>
  );
};

export default App;
