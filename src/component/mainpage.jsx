import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SongCard from './card';
import AddSongForm from './AddSongForm';

// Update the BASE_URL constant
const BASE_URL = 'http://localhost:5000/api';

const MusicApp = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [editingSong, setEditingSong] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [greeting, setGreeting] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch songs on component mount
  useEffect(() => {
    setIsLoading(true);
    fetch(`${BASE_URL}/songs`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Ensure data is an array
        const songsArray = Array.isArray(data) ? data : [];
        setSongs(songsArray);
        setFilteredSongs(songsArray);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching songs:', error);
        showAlert('Error fetching songs', 'error');
        setError(error.message);
        setSongs([]);
        setFilteredSongs([]);
        setIsLoading(false);
      });
  }, []);

  // Filter songs based on search term
  useEffect(() => {
    if (!Array.isArray(songs)) {
      setFilteredSongs([]);
      return;
    }
    
    const results = songs.filter((song) =>
      Object.values(song).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredSongs(results);
  }, [searchTerm, songs]);

  // Set personalized greeting
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          setGreeting("Welcome, Guest");
          return;
        }

        const user = JSON.parse(userData);
        const response = await fetch(`${BASE_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const users = await response.json();
          const userInfo = users.find(u => u.email === user.email);
          
          if (userInfo) {
            const hour = new Date().getHours();
            let timeGreeting = "Hello";

            if (hour < 12) {
              timeGreeting = "Good morning";
            } else if (hour < 18) {
              timeGreeting = "Good afternoon";
            } else {
              timeGreeting = "Good evening";
            }

            setGreeting(`${timeGreeting}, ${userInfo.username}`);
          } else {
            setGreeting("Welcome, Guest");
          }
        } else {
          setGreeting("Welcome, Guest");
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setGreeting("Welcome, Guest");
      }
    };

    fetchUserInfo();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // Update delete handler
  const handleDeleteSong = (id) => {
    fetch(`${BASE_URL}/songs/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(() => {
        setSongs(songs.filter((song) => song.id !== id));
        if (currentlyPlaying === id) {
          setCurrentlyPlaying(null);
        }
        showAlert('Song deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting song:', error);
        showAlert('Error deleting song', 'error');
      });
  };

  // Update update handler
  const handleUpdateSong = () => {
    fetch(`${BASE_URL}/songs/${editingSong.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingSong),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((updatedSong) => {
        setSongs(songs.map((song) => (song.id === updatedSong.id ? updatedSong : song)));
        setEditingSong(null);
        showAlert('Song updated successfully');
      })
      .catch((error) => {
        console.error('Error updating song:', error);
        showAlert('Error updating song', 'error');
      });
  };

  // New audio control handlers
  const handlePlay = (songId) => {
    // If the same song is clicked again while playing, pause it
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      // If a different song is clicked, start playing it
      setCurrentlyPlaying(songId);
    }
  };

  const handlePause = (songId) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    }
  };

  return (
    <div className="full-page bg-white min-h-screen">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 animate-text">
          {greeting}
        </h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search songs..."
            className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading, Error and Empty States */}
        {isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading songs...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-10">
            <p className="text-red-500">Error loading songs: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && filteredSongs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No songs found. Try a different search term or add some songs.</p>
          </div>
        )}

        {/* Songs List Container */}
        {!isLoading && !error && filteredSongs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 py-5">
            {filteredSongs.map((song) => (
              <div key={song.id}>
                {editingSong?.id === song.id ? (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {['title', 'artist', 'album', 'genre', 'year'].map((field) => (
                      <input
                        key={field}
                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingSong[field] || ''}
                        onChange={(e) => setEditingSong({ ...editingSong, [field]: e.target.value })}
                      />
                    ))}
                    <button
                      className="col-span-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={handleUpdateSong}
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <SongCard
                    song={song}
                    isPlaying={currentlyPlaying === song.id}
                    onPlay={() => handlePlay(song.id)}
                    onPause={() => handlePause(song.id)}
                    onEdit={setEditingSong}
                    onDelete={handleDeleteSong}
                    className="w-full"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Message */}
      {alert.show && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {alert.message}
        </div>
      )}
    </div>
  );
};

export default MusicApp;