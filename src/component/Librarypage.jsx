import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import SongCard from './card';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/playlists');
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
      const response = await fetch('http://localhost:5000/api/songs');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
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
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-gray-800">
              {selectedPlaylist?.playlistName || 'Untitled Playlist'}
            </h2>
            <p className="text-gray-600 mt-2">
              {selectedPlaylist?.songs?.length || 0}{' '}
              {(selectedPlaylist?.songs?.length || 0) === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

        {(selectedPlaylist?.songs?.length || 0) === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No songs in this playlist yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedPlaylist?.songs || []).map((song) => (
              <SongCard key={song?.id || `song-${(selectedPlaylist?.songs || []).indexOf(song)}`} song={song} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Playlists</h1>

      {playlists.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          No playlists found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {playlists.map((playlist) => (
            <div
              key={playlist?.id || `playlist-${playlists.indexOf(playlist)}`}
              onClick={() => setSelectedPlaylist(playlist)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-4xl text-white">
                    {(playlist?.playlistName || 'Untitled').charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {playlist?.playlistName || 'Untitled Playlist'}
                </h3>
                <p className="text-gray-600">
                  {playlist?.songs?.length || 0}{' '}
                  {(playlist?.songs?.length || 0) === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-800 mb-4">All Songs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSongs.map((song) => (
          <SongCard key={song?.id || `song-${allSongs.indexOf(song)}`} song={song} />
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
