import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Search, X } from 'lucide-react';
import SongCard from './card';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddSongsForm, setShowAddSongsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/playlists');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      } else {
        setError('Failed to fetch playlists');
      }
    } catch (error) {
      setError('Error loading playlists');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all songs
  const fetchSongs = async () => {
    try {
      const response = await fetch('http://localhost:3002/songs');
      if (response.ok) {
        const data = await response.json();
        setAllSongs(data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, []);

  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3002/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistName: newPlaylistName,
          songs: selectedSongs,
        }),
      });

      if (response.ok) {
        fetchPlaylists();
        setShowCreateForm(false);
        setNewPlaylistName('');
        setSelectedSongs([]);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  // Add songs to existing playlist
  const handleAddSongsToPlaylist = async () => {
    if (!selectedPlaylist || selectedSongs.length === 0) return;

    try {
      const updatedPlaylist = {
        ...selectedPlaylist,
        songs: [...selectedPlaylist.songs, ...selectedSongs]
      };

      const response = await fetch(`http://localhost:3002/playlists/${selectedPlaylist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlaylist),
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedPlaylist(updated);
        setShowAddSongsForm(false);
        setSelectedSongs([]);
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Error adding songs:', error);
    }
  };

  const filteredSongs = allSongs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Song selection form component
  const SongSelectionForm = ({ onSubmit, onCancel, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {title.includes('Create') && (
          <input
            type="text"
            placeholder="Enter playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
        )}

        <div className="mb-4">
          <div className="flex items-center border rounded p-2">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {filteredSongs.map(song => (
            <div
              key={song.id}
              className="flex items-center p-2 hover:bg-gray-100 rounded"
            >
              <input
                type="checkbox"
                checked={selectedSongs.some(s => s.id === song.id)}
                onChange={() => {
                  setSelectedSongs(prev =>
                    prev.some(s => s.id === song.id)
                      ? prev.filter(s => s.id !== song.id)
                      : [...prev, song]
                  );
                }}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{song.title}</div>
                <div className="text-sm text-gray-600">{song.artist}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {title.includes('Create') ? 'Create Playlist' : 'Add Songs'}
          </button>
        </div>
      </div>
    </div>
  );

  // Playlist card component
  const PlaylistCard = ({ playlist }) => (
    <div
      onClick={() => setSelectedPlaylist(playlist)}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-4xl text-white">
            {playlist.playlistName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          {playlist.playlistName}
        </h3>
        <p className="text-gray-600">
          {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading playlists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (selectedPlaylist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-2">Back to Playlists</span>
          </button>
          <div className="flex justify-between items-center mt-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {selectedPlaylist.playlistName}
              </h2>
              <p className="text-gray-600 mt-2">
                {selectedPlaylist.songs.length} {selectedPlaylist.songs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
            <button
              onClick={() => setShowAddSongsForm(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Songs
            </button>
          </div>
        </div>

        {selectedPlaylist.songs.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No songs in this playlist yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedPlaylist.songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}

        {showAddSongsForm && (
          <SongSelectionForm
            title="Add Songs to Playlist"
            onSubmit={handleAddSongsToPlaylist}
            onCancel={() => {
              setShowAddSongsForm(false);
              setSelectedSongs([]);
              setSearchTerm('');
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Playlists</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          No playlists found. Create a new playlist to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      {showCreateForm && (
        <SongSelectionForm
          title="Create New Playlist"
          onSubmit={handleCreatePlaylist}
          onCancel={() => {
            setShowCreateForm(false);
            setNewPlaylistName('');
            setSelectedSongs([]);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
};

export default PlaylistPage;