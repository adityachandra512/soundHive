import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Library, PlusSquare, Heart, User, Music, LogOut, Moon } from 'lucide-react';

const Sidebar = () => {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-teal-600 to-teal-700 text-white flex flex-col p-6 relative shadow-xl">
      <div className="mb-1 flex justify-center">
        <img
          src="../../public/750f168e926d4471a64389ec6bd5f9a8-free-removebg-preview.png"
          className="h-30 w-auto object-contain"
          alt="Logo"
        />
      </div>

      <div className="space-y-1">
        <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-teal-200 mb-2">Main</h3>
        <nav className="space-y-1">
          <NavItem href="/" icon={<Home size={18} />} label="Home" isActive={isActive('/')} />
          <NavItem href="/library" icon={<Library size={18} />} label="Your Library" isActive={isActive('/library')} />
          <NavItem href="/AddSongForm" icon={<PlusSquare size={18} />} label="Add Songs" isActive={isActive('/AddSongForm')} />
        </nav>
      </div>

      <div className="mt-8 space-y-1">
        <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-teal-200 mb-2">Your Music</h3>
        <nav className="space-y-1">
          <NavItem href="/playlists" icon={<PlusSquare size={18} />} label="Create Playlist" isActive={isActive('/playlists')} />
          <NavItem href="/likedSongs" icon={<Heart size={18} />} label="Liked Songs" isActive={isActive('/likedSongs')} />
          <NavItem href="/moodmode" icon={<Moon size={18} />} label="MoodMode" isActive={isActive('/moodmode')} badge="New" />
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-teal-400/30">
        {isSignedIn ? (
          <button
            onClick={handleProfileClick}
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-teal-600/50 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center">
                {userData && userData.username ? userData.username.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{userData ? userData.username : 'User'}</p>
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="w-full px-4 py-2 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-100 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      {showProfileCard && isSignedIn && (
        <div className="absolute bottom-20 left-6 w-52 bg-white text-gray-800 p-4 rounded-lg shadow-xl z-10 border border-teal-200 animate-fadeIn">
          <div className="flex items-center mb-3">
          <div className="w-13 h-12 rounded-full text-2xl font-bold text-teal-800 flex items-center justify-center">
                {userData && userData.username ? userData.username.charAt(0).toUpperCase() : <User size={16} />}
              </div>
            <div>
              <h3 className="font-semibold">{userData?.username}</h3>
              <p className="text-xs text-gray-500">{userData?.email}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <button
              className="w-full py-2 px-3 flex items-center text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              onClick={handleSignOut}
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted NavItem component for better organization
const NavItem = ({ href, icon, label, isActive, badge }) => {
  return (
    <a
      href={href}
      className={`flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-teal-800 text-white font-medium' 
          : 'text-teal-100 hover:bg-teal-600/50 hover:text-white'
      }`}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${isActive ? 'text-teal-200' : 'text-teal-300 group-hover:text-teal-200'}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="bg-teal-200 text-teal-800 text-xs px-2 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      )}
    </a>
  );
};

export default Sidebar;