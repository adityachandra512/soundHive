# SoundHive 🎵

**SoundHive** is a feature-rich music app built with a modern tech stack that offers users an engaging and interactive experience. It provides functionalities like liking songs, creating and managing playlists, viewing liked songs, and seamless user authentication. The app uses a JSON server for the backend and a React + Vite setup for the frontend.

---

## Features ✨

### 🎶 Music Management
- **Like Songs**: Mark your favorite songs with a "like."
- **Liked Songs Section**: Access all your liked songs in a dedicated section.
- **Create Playlists**: Create custom playlists from available songs.
- **Manage Playlists**: Add songs to existing playlists.
- **Library**: Browse all songs and playlists in one place.

### 🔒 User Authentication
- **Sign In/Sign Out**: Secure user authentication system.
- **Profile Display**: View the signed-in user's profile on the sidebar, including their username and email.

### 🖥️ Dynamic Sidebar
- Highlights the current active option for easy navigation.
- Displays user profile details when signed in.

---

## Tech Stack 🚀

### Backend
- **JSON Server**: Provides a mock backend to manage app data such as songs, playlists, and user profiles.

### Frontend
- **React**: For building a fast and interactive user interface.
- **Vite**: Ensures fast development with optimized builds.
- **Tailwind CSS**: Simplifies styling with utility-first classes.
- **Lucide-React**: Provides modern and customizable icons for UI components.

---

## Installation and Setup 🛠️

### Prerequisites
- Node.js installed on your system.
- A package manager like `npm` or `yarn`.

### Steps to Run the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/soundhive.git
   ```
2. Navigate to the project directory:
   ```bash
   cd soundhive
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the JSON server (backend is located in the `server` folder):
   ```bash
   npx json-server --watch server/db.json --port 3002
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open the app in your browser at [http://localhost:5173](http://localhost:5173).

---

## Folder Structure 📁

```
soundhive/
├── public/
│   └── logo.png               # App logo
├── src/
│   ├── components/            # Reusable components (e.g., Sidebar, Playlist)
│   ├── pages/                 # Page components (e.g., Library, Liked Songs)
│   ├── styles/                # Custom styles
│   ├── App.jsx                # Main app component
│   └── index.jsx              # Entry point
├── server/
│   └── db.json                # Mock backend data
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Project metadata and dependencies
```

---

## Usage Instructions 📜

1. **Liking Songs**:
   - Browse songs and click the "Like" button to add them to your liked songs list.
   - View your liked songs in the **Liked Songs** section.

2. **Creating Playlists**:
   - Navigate to the **Create Playlist** section.
   - Select songs to add to your new playlist.
   - Manage your playlists by adding more songs or removing them.

3. **Viewing the Library**:
   - Access all your songs and playlists in the **Library**.

4. **Authentication**:
   - Use the **Sign In/Sign Out** button to toggle authentication.
   - View signed-in user details in the **Profile** section on the sidebar.

---

## Screenshots 📸

### 🎨 Home Page
![Home Page](https://github.com/adityachandra512/song-storage/blob/main/Screenshot%20(8).png)

### ❤️ Liked Songs
![Liked Songs](https://github.com/adityachandra512/song-storage/blob/main/Screenshot%20(10).png)

### 📚 Library
![Library](https://github.com/adityachandra512/song-storage/blob/main/Screenshot%20(9).png)

---

## Customization 🛠️

- **Backend**: Modify the `server/db.json` file to update the song or playlist data.
- **Icons**: Replace Lucide-React icons with any other icon library as per your design preference.
- **Styling**: Update `tailwind.config.js` or add custom CSS classes in the `styles` directory.

---

## Future Enhancements 🚧

- Add a **dark mode** toggle for better user experience.
- Implement **search functionality** to find songs and playlists quickly.
- Enable **song playback** within the app.
- Add **collaborative playlists** for shared music experiences.

---

## License 📜

This project is licensed under the MIT License. Feel free to use, modify, and distribute the code.

---

## Contributors 👥

- **Aditya Chandra**: [GitHub Profile](https://github.com/adityachandra512)
- **Satyam Maurya**: [GitHub Profile](https://github.com/SatyamMaurya7)
- **Athul T.M**: [GitHub Profile](https://github.com/AthulTM)
- **Avadesh kumar**: [GitHub Profile](https://github.com/adityachandra512)
---

Enjoy building your playlists and exploring music with **SoundHive**! 🎧
