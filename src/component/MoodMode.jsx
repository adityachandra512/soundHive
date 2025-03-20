import React, { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, SkipForward, Music } from 'lucide-react';

const MoodMode = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const audioRef = useRef(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import('face-api.js');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
        alert('Error loading face detection models. Please refresh the page.');
      }
    };
    loadModels();
  }, []);

  // Start camera capture
  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        streamRef.current = stream;
        setIsCapturing(true);
        
        // Reset states when starting new capture
        setCurrentMood(null);
        setCurrentPlaylist([]);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // Stop camera capture
  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  // Toggle play/pause
  const togglePlay = async () => {
    if (!audioRef.current && currentPlaylist.length > 0) {
      audioRef.current = new Audio(currentPlaylist[currentSongIndex].audioUrl);
      audioRef.current.addEventListener('ended', handleSkip);
    }

    try {
      if (isPlaying && audioRef.current) {
        await audioRef.current.pause();
      } else if (audioRef.current) {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  // Handle skip to next song
  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentSongIndex((prev) => {
      const nextIndex = prev + 1 < currentPlaylist.length ? prev + 1 : 0;
      
      // Load new song
      if (audioRef.current && currentPlaylist.length > 0) {
        audioRef.current.src = currentPlaylist[nextIndex].audioUrl;
        if (isPlaying) {
          audioRef.current.play();
        }
      }
      
      return nextIndex;
    });
  };

  // Cleanup effect for audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleSkip);
      }
    };
  }, []);

  // Fetch songs based on detected mood
  const fetchSongsByMood = async (mood) => {
    let genre = '';
    try {
      switch (mood.toLowerCase()) {
        case 'happy':
        case 'neutral':
          genre = 'Romantic';
          break;
        case 'sad':
          genre = 'Classical';
          break;
        case 'angry':
          genre = 'Rock';
          break;
        case 'surprised':
          genre = 'Hip-hop';
          break;
        default:
          genre = 'Romantic';
      }

      console.log('Fetching songs for genre:', genre);

      const response = await fetch(`http://localhost:5000/api/songs/genre/${genre}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      const songs = await response.json();
      
      if (Array.isArray(songs) && songs.length > 0) {
        // Extract only the needed properties and format the audio URL
        const formattedSongs = songs.map(song => ({
          name: song.title || song.name,
          genre: song.genre,
          audioUrl: song.audioUrl.replace(
            'github.com',
            'raw.githubusercontent.com'
          ).replace('/blob', '')
        }));
        
        setCurrentPlaylist(formattedSongs);
        setCurrentSongIndex(0);
        
        // Initialize audio and start playing
        if (formattedSongs.length > 0) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeEventListener('ended', handleSkip);
          }
          
          audioRef.current = new Audio(formattedSongs[0].audioUrl);
          audioRef.current.addEventListener('ended', handleSkip);
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(error => {
            console.error('Error playing audio:', error);
          });
        }
      } else {
        throw new Error('No songs found');
      }

    } catch (error) {
      console.error('Error fetching songs:', error);
      alert('Error loading songs. Please try again.');
    }
  };

  // Capture image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas reference not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Create image from canvas
    const imageData = canvas.toDataURL('image/png');
    if (imageRef.current) {
      imageRef.current.src = imageData;
    }
    
    // Start emotion analysis
    analyzeEmotion();
  };

  // Analyze emotion from captured image
  const analyzeEmotion = async () => {
    if (!canvasRef.current || !modelsLoaded) {
      console.error('Canvas reference not available or models not loaded');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Wait for a moment to ensure canvas is ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Import face-api dynamically
      const faceapi = await import('face-api.js');
      
      const detections = await faceapi
        .detectSingleFace(
          canvasRef.current, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
        )
        .withFaceExpressions();

      if (detections) {
        console.log('Detected expressions:', detections.expressions);
        const emotions = detections.expressions;
        const dominantEmotion = Object.keys(emotions).reduce((a, b) => 
          emotions[a] > emotions[b] ? a : b
        );

        setCurrentMood(dominantEmotion);
        await fetchSongsByMood(dominantEmotion);
      } else {
        console.log('No face detected');
        alert('No face detected. Please try again with your face clearly visible.');
      }
      
      // Stop video capture after analysis
      stopCapture();
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error detecting mood:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          MoodMode - Music for Your Mood
        </h1>
        <p className="text-gray-600">Let us detect your mood and play the perfect music for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Camera Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
            {/* Video display */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${!isCapturing && 'hidden'}`}
            />
            
            {/* Captured image display */}
            <img 
              ref={imageRef}
              className={`w-full h-full object-cover ${(isCapturing || !currentMood) && 'hidden'}`}
              alt="Captured"
            />
            
            {/* Initial state display */}
            {!isCapturing && !currentMood && (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <Camera size={64} className="text-gray-400" />
              </div>
            )}
            
            {/* Overlay for analyzing state */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Analyzing your mood...</p>
                </div>
              </div>
            )}
            
            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="absolute top-0 left-0 hidden" />
          </div>

          <div className="flex justify-center space-x-4">
            {!isCapturing && !currentMood && (
              <button
                onClick={startCapture}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                disabled={!modelsLoaded}
              >
                <Camera className="mr-2" size={20} />
                {modelsLoaded ? "Start Camera" : "Loading Models..."}
              </button>
            )}
            
            {isCapturing && !isAnalyzing && (
              <button
                onClick={captureImage}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Capture & Analyze
              </button>
            )}
            
            {currentMood && !isCapturing && (
              <button
                onClick={startCapture}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Camera className="mr-2" size={20} />
                Try Again
              </button>
            )}
          </div>
        </div>

        {/* Mood and Music Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          {currentMood ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Current Mood: <span className="text-purple-600 capitalize">{currentMood}</span>
              </h2>
              
              <div className="space-y-4">
                {currentPlaylist.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Now Playing</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <Music className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{currentPlaylist[currentSongIndex].name}</p>
                          <p className="text-sm text-gray-600">Genre: {currentPlaylist[currentSongIndex].genre}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 hover:bg-gray-200 rounded-full"
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-200 rounded-full"
                          onClick={handleSkip}
                        >
                          <SkipForward size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium">Up Next</h3>
                  {currentPlaylist.slice(currentSongIndex + 1, currentSongIndex + 4).map((song, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <p className="font-medium">{song.name}</p>
                      <p className="text-sm text-gray-600">Genre: {song.genre}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Music size={48} className="mb-4" />
              <p>Follow these steps:</p>
              <ol className="list-decimal text-left mt-2 pl-5">
                <li>Click "Start Camera"</li>
                <li>Position your face in the frame</li>
                <li>Click "Capture & Analyze"</li>
                <li>Wait for mood detection</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodMode;