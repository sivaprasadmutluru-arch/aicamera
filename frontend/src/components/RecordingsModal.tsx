import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { camerasApi, type Recording } from "../api/cameras";
import { ApiError } from "../api/client";
import Button from "./Button";
import Modal from "./Modal";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDuration(startSec: number, endSec: number): string {
  const totalSeconds = Math.max(0, endSec - startSec);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function RecordingsModal({
  cameraId,
  cameraName,
  onClose,
}: {
  cameraId: number;
  cameraName: string;
  onClose: () => void;
}) {
  const today = new Date();
  const [fromDate, setFromDate] = useState(toDateInputValue(today));
  const [toDate, setToDate] = useState(toDateInputValue(today));

  const [recordings, setRecordings] = useState<Recording[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Recording | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  async function handleSearch() {
    setSearching(true);
    setSearchError(null);
    setRecordings(null);
    setSelected(null);
    try {
      const from = Math.floor(new Date(fromDate + "T00:00:00").getTime() / 1000);
      const to = Math.floor(new Date(toDate + "T23:59:59").getTime() / 1000);
      const results = await camerasApi.searchRecordings(cameraId, from, to);
      setRecordings(results.sort((a, b) => b.startTime - a.startTime));
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : "Failed to search recordings");
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId]);

  useEffect(() => {
    if (!selected || !videoRef.current) return;

    let cancelled = false;
    setPlayerLoading(true);
    setPlayerError(null);

    hlsRef.current?.destroy();
    hlsRef.current = null;

    camerasApi
      .recordingPlaybackUrl(cameraId, selected)
      .then(({ streamUrl }) => {
        if (cancelled || !videoRef.current) return;
        const video = videoRef.current;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!cancelled && data.fatal) {
              setPlayerError(`Playback error: ${data.details}`);
            }
          });
          hlsRef.current = hls;
        } else {
          setPlayerError("HLS playback isn't supported in this browser.");
          setPlayerLoading(false);
          return;
        }
        video.play().catch(() => {
          // playback may require a user gesture; not a fatal error
        });
        setPlayerLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setPlayerError(err instanceof ApiError ? err.message : "Failed to load recording");
          setPlayerLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selected, cameraId]);

  useEffect(
    () => () => {
      hlsRef.current?.destroy();
    },
    []
  );

  return (
    <Modal title={`Recordings: ${cameraName}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 text-sm"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-3 py-2">
            {searchError}
          </div>
        )}

        {selected && (
          <div className="relative aspect-video bg-ink-900 rounded-lg overflow-hidden flex items-center justify-center">
            {playerError ? (
              <p className="text-red-300 text-sm px-6 text-center">{playerError}</p>
            ) : (
              <>
                {playerLoading && (
                  <p className="absolute inset-0 flex items-center justify-center text-ink-300 text-sm">
                    Loading...
                  </p>
                )}
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video ref={videoRef} className="w-full h-full" controls />
              </>
            )}
          </div>
        )}

        <div className="max-h-64 overflow-y-auto border border-ink-100 dark:border-ink-700 rounded-lg divide-y divide-ink-50 dark:divide-ink-800">
          {recordings && recordings.length === 0 && !searching && (
            <p className="text-sm text-ink-400 text-center py-6">
              No recordings found for this date range.
            </p>
          )}
          {recordings?.map((recording, index) => (
            <button
              key={`${recording.streamId}-${index}`}
              onClick={() => setSelected(recording)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors ${
                selected === recording ? "bg-primary-50 dark:bg-primary-900/20" : ""
              }`}
            >
              <p className="font-medium text-ink-800 dark:text-ink-100">
                {new Date(recording.startTime * 1000).toLocaleString()}
              </p>
              <p className="text-ink-400 text-xs">
                Duration: {formatDuration(recording.startTime, recording.endTime)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
