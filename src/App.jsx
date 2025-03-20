import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './component/sidebar';
import MainPage from './component/mainpage';
import SignIn from './component/signup';
import LikedSongsPage from "./component/LikedSongsPage"; 
import AddSongForm from './component/AddSongForm';
import PlaylistPage from './component/playlist';
import LibraryPage from './component/Librarypage';
import MoodMode from './component/MoodMode';

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Show Sidebar on specific pages */}
      {['/', '/likedSongs', '/AddSongForm', '/playlists','/library','/moodmode'].includes(location.pathname) && <Sidebar />}

      <main className="flex-1 overflow-y-auto bg-gray-100">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/likedSongs" element={<LikedSongsPage />} />
          <Route path="/AddSongForm" element={<AddSongForm />} />
          <Route path="/playlists" element={<PlaylistPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/moodmode" element={<MoodMode />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
    </div>
  );
};

export default App;
