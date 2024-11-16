import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SongCard from './card';
import AddSongForm from './AddSongForm';

const BASE_URL = 'http://localhost:3002';

const MusicApp = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [editingSong, setEditingSong] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/songs`)
      .then((res) => res.json())
      .then((data) => {
        setSongs(data);
        setFilteredSongs(data);
      })
      .catch((error) => {
        console.error('Error fetching songs:', error);
        showAlert('Error fetching songs', 'error');
      });
  }, []);

  useEffect(() => {
    const results = songs.filter((song) =>
      Object.values(song).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredSongs(results);
  }, [searchTerm, songs]);

  
  useEffect(() => {
    // Retrieve the user data from local storage
    const userData = localStorage.getItem("user");

    if (userData) {
      // Parse the JSON string to an object
      const user = JSON.parse(userData);

      // Extract the username
      const userName = user.username;

      // Get the current hour to determine the time of day
      const hour = new Date().getHours();
      let timeGreeting = "Hello"; // Default greeting

      if (hour < 12) {
        timeGreeting = "Good morning";
      } else if (hour < 18) {
        timeGreeting = "Good afternoon";
      } else {
        timeGreeting = "Good evening";
      }

      // Set the personalized greeting
      setGreeting(`${timeGreeting}, ${userName}`);
    } else {
      // Default fallback if user data is not found
      setGreeting("Welcome, User");
    }
  }, []);


  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const handleDeleteSong = (id) => {
    fetch(`${BASE_URL}/songs/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setSongs(songs.filter((song) => song.id !== id));
        showAlert('Song deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting song:', error);
        showAlert('Error deleting song', 'error');
      });
  };

  const handleUpdateSong = () => {
    fetch(`${BASE_URL}/songs/${editingSong.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingSong),
    })
      .then((res) => res.json())
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

        {/* Songs List Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 py-5">
          {filteredSongs.map((song) => (
            <div key={song.id}>
              {editingSong?.id === song.id ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {['title', 'artist', 'album', 'genre', 'year'].map((field) => (
                    <input
                      key={field}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingSong[field]}
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
                  onEdit={setEditingSong}
                  onDelete={handleDeleteSong}
                  className="w-full" // Ensure card takes full width within grid
                />
              )}
            </div>
          ))}
        </div>
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
