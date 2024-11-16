import React, { useEffect, useState } from "react";
import { Heart, Plus } from "lucide-react"; // Icons for additional functionality

// Function to convert GitHub blob link to raw link
const convertToRawLink = (githubLink) => {
  return githubLink
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
};

// Song card component
const SongCard = ({ song }) => {
  // Ensure audioUrl is processed before being used
  const audioSrc = song.audioUrl.includes("github.com")
    ? convertToRawLink(song.audioUrl)
    : song.audioUrl;

  // Handle "like" action
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
        alert(`${song.title} has been added to liked songs.`);
      } else {
        console.error("Failed to like the song:", response.statusText);
      }
    } catch (error) {
      console.error("Error liking the song:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4">
      <h3 className="text-lg font-bold text-gray-800 truncate">{song.title}</h3>
      <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden my-3">
        <img
          src={song.image || "https://via.placeholder.com/150"}
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

  // Fetch liked songs from the JSON server
  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await fetch("http://localhost:3002/likedSongs");
        if (response.ok) {
          const data = await response.json();
          setLikedSongs(data);
        } else {
          console.error("Failed to fetch liked songs:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Liked Songs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {likedSongs.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No liked songs yet.
          </p>
        ) : (
          likedSongs.map((song) => <SongCard key={song.id} song={song} />)
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;
