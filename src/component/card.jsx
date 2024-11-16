import React, { useState, useEffect } from "react";
import { Heart, Plus } from "lucide-react";

const convertToRawLink = (githubLink) => {
  return githubLink
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
};

const SongCard = ({ song }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [action, setAction] = useState("new");

  const audioSrc = song.audioUrl?.includes("github.com")
    ? convertToRawLink(song.audioUrl)
    : song.audioUrl || "";

  const handleLike = async () => {
    try {
      const response = await fetch("http://localhost:3002/likedSongs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(song),
      });

      if (response.ok) {
        setIsLiked(true);
        alert(`${song.title} has been added to liked songs.`);
      } else {
        console.error("Failed to like the song:", response.statusText);
      }
    } catch (error) {
      console.error("Error liking the song:", error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:3002/playlists");
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      } else {
        console.error("Failed to fetch playlists:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const handleAddToPlaylist = async () => {
    if (action === "new" && !playlistName) {
      alert("Please enter a playlist name.");
      return;
    }

    if (action === "existing" && !selectedPlaylist) {
      alert("Please select a playlist.");
      return;
    }

    try {
      let response;
      
      if (action === "new") {
        // Create new playlist
        response = await fetch("http://localhost:3002/playlists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playlistName,
            songs: [song]
          }),
        });
      } else {
        // Find the selected playlist
        const playlist = playlists.find(p => p.playlistName === selectedPlaylist);
        if (!playlist) {
          alert("Selected playlist not found.");
          return;
        }

        // Update existing playlist
        response = await fetch(`http://localhost:3002/playlists/${playlist.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...playlist,
            songs: [...playlist.songs, song]
          }),
        });
      }

      if (response.ok) {
        alert(
          action === "new"
            ? `Playlist "${playlistName}" created with the song.`
            : `Song added to playlist "${selectedPlaylist}".`
        );
        setShowModal(false);
        setPlaylistName("");
        setSelectedPlaylist("");
      } else {
        console.error("Failed to save playlist:", response.statusText);
        alert("Failed to save playlist. Please try again.");
      }
    } catch (error) {
      console.error("Error saving playlist:", error);
      alert("Error saving playlist. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 w-full relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 truncate" title={song.title}>
          {song.title}
        </h3>
        <button
          onClick={() => {
            fetchPlaylists();
            setShowModal(true);
          }}
          className="p-1 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-500 transition-colors"
          aria-label="Add to playlist"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden mb-3">
        <img
          src={song.image || "https://via.placeholder.com/150"}
          alt={song.title}
          className="object-cover w-full h-full"
        />
      </div>

      {audioError ? (
        <p className="text-sm text-red-500">Audio failed to load.</p>
      ) : (
        <audio
          controls
          className="w-full"
          onError={() => setAudioError(true)}
        >
          <source src={audioSrc} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}

      <div className="flex flex-col space-y-1 mb-3">
        <span className="text-sm text-gray-600">Artist: {song.artist || "Unknown"}</span>
        <span className="text-sm text-gray-600">Album: {song.album || "Unknown"}</span>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Genre: {song.genre || "Unknown"}</span>
          <span className="text-sm text-gray-600">Year: {song.year || "Unknown"}</span>
        </div>
      </div>

      <button
        onClick={handleLike}
        disabled={isLiked}
        className={`flex items-center justify-center p-2 rounded-full w-full ${
          isLiked
            ? "bg-pink-500 text-white cursor-not-allowed"
            : "bg-gray-100 hover:bg-pink-100 text-pink-500 transition-colors"
        }`}
        aria-label="Like song"
      >
        <Heart className="h-5 w-5" />
        <span className="ml-2">{isLiked ? "Liked" : "Like"}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select an Action:
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="new">Create New Playlist</option>
                <option value="existing">Add to Existing Playlist</option>
              </select>
            </div>
            {action === "new" ? (
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Enter playlist name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            ) : (
              <select
                value={selectedPlaylist}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              >
                <option value="">Select a playlist</option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.playlistName}>
                    {playlist.playlistName}
                  </option>
                ))}
              </select>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToPlaylist}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongCard;