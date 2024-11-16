import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Library, PlusSquare, Heart, User } from 'lucide-react';

const Sidebar = () => {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  useEffect(() => {
    const savedUserData = localStorage.getItem('user');
    if (savedUserData) {
      const parsedUserData = JSON.parse(savedUserData);
      setUserData(parsedUserData);
      setIsSignedIn(true);
    }
  }, []);

  const handleProfileClick = () => {
    setShowProfileCard((prevShow) => !prevShow);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setShowProfileCard(false);
    setUserData(null);
    localStorage.removeItem('user');
  };

  const handleSignIn = () => {
    navigate('/signin');
    setIsSignedIn(true);
  };

  // Function to determine if the option is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-teal-500 text-stone-950 flex flex-col p-6 relative shadow-lg">
      <div className="mb-8">
        <img
          src="../../public/750f168e926d4471a64389ec6bd5f9a8-free-removebg-preview.png"
          className="h-100 w-100 mx-auto"
          alt="Logo"
        />
      </div>

      <nav className="space-y-6">
        <div className="flex flex-col space-y-4">
          <a
            href="/"
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive('/') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Home</span>
          </a>
          <a
            href="/library"
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive('/library') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
            }`}
          >
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </a>
          <a
            href="/AddSongForm"
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive('/AddSongForm') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
            }`}
          >
            <PlusSquare className="w-6 h-6" />
            <span>Add Songs</span>
          </a>
        </div>
      </nav>

      <div className="mt-8 space-y-6">
        <div className="flex flex-col space-y-4">
          <a
            href="/playlists"
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive('/playlists') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
            }`}
          >
            <PlusSquare className="w-6 h-6" />
            <span>Create Playlist</span>
          </a>
          <a
            href="/liked-songs"
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive('/liked-songs') ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
            }`}
          >
            <Heart className="w-6 h-6" />
            <span>Liked Songs</span>
          </a>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        {isSignedIn ? (
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-3 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 w-full text-left"
          >
            <User className="w-6 h-6" />
            <span>Profile</span>
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center space-x-3 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 w-full text-left"
          >
            <User className="w-6 h-6" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {showProfileCard && isSignedIn && userData && (
        <div className="absolute bottom-20 left-6 w-52 bg-gray-800 text-gray-300 p-4 rounded-md shadow-lg z-10">
          <h3 className="text-lg font-semibold text-white">User Profile</h3>
          <p className="mt-2 text-sm">Username: {userData.username}</p>
          <p className="text-sm">Email: {userData.email}</p>
          <button
            className="w-full mt-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
