import React, { useEffect, useState } from "react";
import { Heart, X } from "lucide-react"; // Changed Plus to X for remove functionality

// Function to convert GitHub blob link to raw link
const convertToRawLink = (githubLink) => {
  return githubLink
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
};

// Song card component
const SongCard = ({ song, onRemove }) => {
  // Ensure audioUrl is processed before being used
  const audioSrc = song.audioUrl && song.audioUrl.includes("github.com")
    ? convertToRawLink(song.audioUrl)
    : song.audioUrl;

  // Handle "like" action - renamed to handleAddToLiked for clarity
  const handleAddToLiked = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Please login to like songs');
        return;
      }

      const user = JSON.parse(userData);
      const songData = {
        id: song._id || song.id,
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        audioUrl: song.audioUrl,
        userId: user.email,
        album: song.album,
        year: song.year,
        image: song.image
      };

      const response = await fetch("http://localhost:5000/api/likedSongs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songData),
      });
      
      if (response.ok) {
        alert(`${song.title} has been added to liked songs.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to like the song");
      }
    } catch (error) {
      console.error("Error liking the song:", error);
      alert(error.message);
    }
  };

  // Handle remove from liked songs
  const handleRemoveFromLiked = async () => {
    try {
      if (onRemove && song.id) {
        onRemove(song.id);
      }
    } catch (error) {
      console.error("Error removing the song:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800 truncate">{song.title}</h3>
        <button 
          onClick={handleRemoveFromLiked} 
          className="p-1 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Remove from liked songs"
        >
          <X size={18} />
        </button>
      </div>
      <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden my-3">
        <img
          src={song.image || "/api/placeholder/150/150"}
          alt={song.title}
          className="object-cover w-full h-full"
        />
      </div>
      <audio controls className="w-full">
        <source src={audioSrc} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
      <div className="mt-3 text-sm text-gray-600">
        <p>Artist: {song.artist}</p>
        <p>Album: {song.album}</p>
        <p>Genre: {song.genre}</p>
        <p>Year: {song.year}</p>
      </div>
    </div>
  );
};

// Liked Songs Page
const LikedSongsPage = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch liked songs from the server
  const fetchLikedSongs = async () => {
    setIsLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError("Please login to view liked songs");
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`http://localhost:5000/api/likedSongs/${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikedSongs(data || []);
        setError(null);
      } else {
        console.error("Failed to fetch liked songs:", response.statusText);
        setError("Failed to load liked songs. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      setError("An error occurred while loading your liked songs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  // Handle removing a song from liked songs
  const handleRemoveSong = async (songId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/likedSongs/${songId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Remove the song from the local state
        setLikedSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
        alert("Song removed from liked songs.");
      } else {
        console.error("Failed to remove song:", response.statusText);
      }
    } catch (error) {
      console.error("Error removing song:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Liked Songs</h1>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading your liked songs...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          <p>{error}</p>
          <button 
            onClick={fetchLikedSongs}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likedSongs.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No liked songs yet.
            </p>
          ) : (
            likedSongs.map((song) => (
              <SongCard 
                key={song.id} 
                song={song} 
                onRemove={handleRemoveSong}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LikedSongsPage;