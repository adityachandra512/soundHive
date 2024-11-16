import React, { useState, useEffect } from "react";

const AddSongPage = () => {
  const [songs, setSongs] = useState([]); // List of songs from the database
  const [songDetails, setSongDetails] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    year: "",
    image: "",
    audioUrl: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false); // Toggle form visibility
  const [successMessage, setSuccessMessage] = useState("");
  const [editMode, setEditMode] = useState(false); // Track whether editing or adding
  const [editingSongId, setEditingSongId] = useState(null); // ID of song being edited

  // Fetch songs from database
  useEffect(() => {
    fetch("http://localhost:3002/songs")
      .then((response) => response.json())
      .then((data) => setSongs(data))
      .catch((error) => console.error("Error fetching songs:", error));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSongDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  // Handle form submission for adding or editing songs
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode
        ? `http://localhost:3002/songs/${editingSongId}`
        : "http://localhost:3002/songs";
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songDetails),
      });

      if (response.ok) {
        setSuccessMessage(
          editMode ? "Song updated successfully!" : "Song added successfully!"
        );
        setSongDetails({
          title: "",
          artist: "",
          album: "",
          genre: "",
          year: "",
          image: "",
          audioUrl: "",
        });
        setIsFormVisible(false);
        setEditMode(false);
        setEditingSongId(null);

        // Refresh songs
        fetch("http://localhost:3002/songs")
          .then((response) => response.json())
          .then((data) => setSongs(data));
      } else {
        console.error("Failed to add/update song:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding/updating song:", error);
    }
  };

  // Handle deleting a song
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/songs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSongs((prevSongs) => prevSongs.filter((song) => song.id !== id));
      } else {
        console.error("Failed to delete song:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  // Handle editing a song
  const handleEdit = (song) => {
    setSongDetails(song);
    setEditMode(true);
    setEditingSongId(song.id);
    setIsFormVisible(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Table to Display Songs */}
      {!isFormVisible && (
        <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-lg"> {/* Increased table width */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Songs List</h2>
            <button
              onClick={() => setIsFormVisible(true)}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
            >
              Add Song
            </button>
          </div>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Title</th>
                <th className="border border-gray-300 px-4 py-2">Artist</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id}>
                  <td className="border border-gray-300 px-4 py-2">{song.title}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {song.artist}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(song)}
                      className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(song.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Song Form */}
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4 mt-6"
        >
          <h2 className="text-lg font-bold">
            {editMode ? "Edit Song" : "Add New Song"}
          </h2>
          <div>
            <label htmlFor="title" className="block font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={songDetails.title}
              onChange={handleChange}
              className="mt-1 p-2 border w-full rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="artist" className="block font-medium text-gray-700">
              Artist
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={songDetails.artist}
              onChange={handleChange}
              className="mt-1 p-2 border w-full rounded-md"
              required
            />
          </div>
          {/* Other Form Fields */}
          <div>
            <label htmlFor="album" className="block font-medium text-gray-700">
              Album
            </label>
            <input
              type="text"
              id="album"
              name="album"
              value={songDetails.album}
              onChange={handleChange}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
          <div>
            <label htmlFor="genre" className="block font-medium text-gray-700">
              Genre
            </label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={songDetails.genre}
              onChange={handleChange}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
          <div>
            <label htmlFor="year" className="block font-medium text-gray-700">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={songDetails.year}
              onChange={handleChange}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
          <div>
            <label htmlFor="image" className="block font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={songDetails.image}
              onChange={handleChange}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="audioUrl"
              className="block font-medium text-gray-700"
            >
              Audio URL
            </label>
            <input
              type="url"
              id="audioUrl"
              name="audioUrl"
              value={songDetails.audioUrl}
              onChange={handleChange}
              className="mt-1 p-2 border w-full rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
          >
            {editMode ? "Update Song" : "Add Song"}
          </button>
          <button
            type="button"
            onClick={() => setIsFormVisible(false)}
            className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      {successMessage && (
        <div className="mt-4 text-center text-green-500">{successMessage}</div>
      )}
    </div>
  );
};

export default AddSongPage;
