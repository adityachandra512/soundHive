import React, { useState, useEffect, useRef } from "react";
import { Heart, Plus } from "lucide-react";

const convertToRawLink = (githubLink) => {
  return githubLink
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
};

const SongCard = ({ 
  song, 
  isPlaying, 
  onPlay, 
  onPause 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [action, setAction] = useState("new");
  
  const audioRef = useRef(null);

  const audioSrc = song.audioUrl?.includes("github.com")
    ? convertToRawLink(song.audioUrl)
    : song.audioUrl || "";

  useEffect(() => {
    checkIfSongIsLiked();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setAudioError(true);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const checkIfSongIsLiked = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('User not logged in');
        return;
      }
      
      const user = JSON.parse(userData);
      // Use email instead of id for user identification
      const response = await fetch(`http://localhost:5000/api/likedSongs/${user.email}`);
      
      if (response.ok) {
        const likedSongs = await response.json();
        const isAlreadyLiked = likedSongs.some(
          (likedSong) => likedSong.title === song.title && likedSong.artist === song.artist
        );
        setIsLiked(isAlreadyLiked);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error("Error checking liked songs:", error);
    }
  };

  const handleLike = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Please login to like songs');
        return;
      }
      
      const user = JSON.parse(userData);
      const songData = {
        id: song._id || song.id, // Use existing ID
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        audioUrl: song.audioUrl,
        userId: user.email, // Using email as userId
        // Optional fields
        album: song.album || '',
        year: song.year || '',
        image: song.image || '',
        likedAt: new Date().toISOString()
      };

      // Validate required fields
      const requiredFields = ['id', 'title', 'artist', 'genre', 'audioUrl', 'userId'];
      const missingFields = requiredFields.filter(field => !songData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const likeResponse = await fetch("http://localhost:5000/api/likedSongs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });

      if (likeResponse.ok) {
        setIsLiked(true);
        alert(`${song.title} has been added to liked songs.`);
      } else {
        const errorData = await likeResponse.json();
        console.error("Like song error:", errorData);
        throw new Error(errorData.message || "Failed to like the song");
      }
    } catch (error) {
      console.error("Error liking the song:", error);
      alert(error.message || "Error adding song to liked songs");
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/playlists");
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
        response = await fetch("http://localhost:5000/api/playlists", {
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
        const playlist = playlists.find(p => p.playlistName === selectedPlaylist);
        if (!playlist) {
          alert("Selected playlist not found.");
          return;
        }

        response = await fetch(`http://localhost:5000/api/playlists/${playlist.id}`, {
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
        <div className="w-full">
          <audio
            ref={audioRef}
            src={audioSrc}
            onError={() => setAudioError(true)}
            onEnded={() => onPause(song.id)}
            onPlay={() => onPlay(song.id)}
            onPause={() => onPause(song.id)}
            controls
            className="w-full"
          />
        </div>
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
        <span className="ml-2">{isLiked ? "Already Liked" : "Like"}</span>
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

