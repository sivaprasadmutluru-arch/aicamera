import flvjs from "flv.js";
import { useEffect, useRef, useState } from "react";
import { camerasApi } from "../api/cameras";
import { ApiError } from "../api/client";
import Modal from "./Modal";

export default function LiveViewModal({
  cameraId,
  cameraName,
  onClose,
}: {
  cameraId: number;
  cameraName: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<flvjs.Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError(null);
      try {
        const { streamUrl } = await camerasApi.liveStreamUrl(cameraId);
        if (cancelled || !videoRef.current) return;

        if (!flvjs.isSupported()) {
          setError("Live FLV playback isn't supported in this browser.");
          setLoading(false);
          return;
        }

        const player = flvjs.createPlayer({ type: "flv", url: streamUrl, isLive: true });
        player.attachMediaElement(videoRef.current);
        player.on(flvjs.Events.ERROR, (_type: string, detail: string) => {
          if (!cancelled) setError(`Playback error: ${detail}`);
        });
        player.load();
        Promise.resolve(player.play()).catch(() => {
          // autoplay can be blocked until the user interacts with the page; not a fatal error
        });
        playerRef.current = player;
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to start live view");
          setLoading(false);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [cameraId]);

  return (
    <Modal title={`Live View: ${cameraName}`} onClose={onClose}>
      <div className="relative aspect-video bg-ink-900 rounded-lg overflow-hidden flex items-center justify-center">
        {error ? (
          <p className="text-red-300 text-sm px-6 text-center">{error}</p>
        ) : (
          <>
            {loading && (
              <p className="absolute inset-0 flex items-center justify-center text-ink-300 text-sm">
                Connecting...
              </p>
            )}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="w-full h-full" controls autoPlay muted />
          </>
        )}
      </div>
    </Modal>
  );
}
