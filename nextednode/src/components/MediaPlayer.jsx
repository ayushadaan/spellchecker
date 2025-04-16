import React, { useState, useRef } from "react";

const MediaPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((currentTime / duration) * 100);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="flex flex-col items-center p-6 bg-gray-900 rounded-lg shadow-lg w-72">
        <audio
          ref={audioRef}
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          onTimeUpdate={handleTimeUpdate}
        />

        <div className="text-white text-xl mb-4">React Audio Player</div>

        <div className="w-full mb-4">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-full"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-400 rounded-lg cursor-pointer"
        />
        <div className="text-white mt-2 text-center">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
