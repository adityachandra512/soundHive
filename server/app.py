from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB configuration
MONGODB_URI = "mongodb+srv://adityachandra419:Gl3N9MFqoxGjIttw@cluster0.odktx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "SongHive"

# Collections
SONGS_COLLECTION = "Songs"
USERS_COLLECTION = "Users"
LIKED_SONGS_COLLECTION = "LikedSongs"
PLAYLISTS_COLLECTION = "Playlists"

def get_db():
    client = MongoClient(MONGODB_URI)
    return client[DB_NAME]

# Helper function to convert MongoDB ObjectId to string
def serialize_doc(doc):
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc

# Initialize database with data from db.json if collections are empty
def init_db():
    try:
        db = get_db()
        
        # Load data from db.json
        with open('db.json', 'r') as file:
            data = json.load(file)
        
        # Initialize collections if they're empty
        if db[SONGS_COLLECTION].count_documents({}) == 0 and "songs" in data:
            db[SONGS_COLLECTION].insert_many(data["songs"])
            print(f"Initialized {SONGS_COLLECTION} collection")
            
        if db[USERS_COLLECTION].count_documents({}) == 0 and "users" in data:
            db[USERS_COLLECTION].insert_many(data["users"])
            print(f"Initialized {USERS_COLLECTION} collection")
            
        if db[LIKED_SONGS_COLLECTION].count_documents({}) == 0 and "likedSongs" in data:
            db[LIKED_SONGS_COLLECTION].insert_many(data["likedSongs"])
            print(f"Initialized {LIKED_SONGS_COLLECTION} collection")
            
        if db[PLAYLISTS_COLLECTION].count_documents({}) == 0 and "playlists" in data:
            db[PLAYLISTS_COLLECTION].insert_many(data["playlists"])
            print(f"Initialized {PLAYLISTS_COLLECTION} collection")
            
    except Exception as e:
        print(f"Error initializing database: {e}")

# Songs endpoints
@app.route('/api/songs', methods=['GET'])
def get_songs():
    try:
        db = get_db()
        songs = list(db[SONGS_COLLECTION].find())
        serialized_songs = [serialize_doc(song) for song in songs]
        return jsonify(serialized_songs)
    except Exception as e:
        print(f"Error fetching songs: {e}")
        return jsonify({"error": "Failed to fetch songs"}), 500

@app.route('/api/songs', methods=['POST'])
def add_song():
    try:
        song_data = request.json
        db = get_db()
        result = db[SONGS_COLLECTION].insert_one(song_data)
        return jsonify({
            "acknowledged": result.acknowledged,
            "inserted_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        print(f"Error adding song: {e}")
        return jsonify({"error": "Failed to add song"}), 500

@app.route('/api/songs/<id>', methods=['GET'])
def get_song(id):
    try:
        db = get_db()
        song = db[SONGS_COLLECTION].find_one({"id": id})
        if song:
            return jsonify(serialize_doc(song))
        return jsonify({"error": "Song not found"}), 404
    except Exception as e:
        print(f"Error fetching song: {e}")
        return jsonify({"error": "Failed to fetch song"}), 500

@app.route('/api/songs/<id>', methods=['PUT'])
def update_song(id):
    try:
        song_data = request.json
        db = get_db()
        result = db[SONGS_COLLECTION].update_one(
            {"id": id},
            {"$set": song_data}
        )
        return jsonify({
            "acknowledged": result.acknowledged,
            "modified_count": result.modified_count
        })
    except Exception as e:
        print(f"Error updating song: {e}")
        return jsonify({"error": "Failed to update song"}), 500

@app.route('/api/songs/<id>', methods=['DELETE'])
def delete_song(id):
    try:
        db = get_db()
        result = db[SONGS_COLLECTION].delete_one({"id": id})
        return jsonify({
            "acknowledged": result.acknowledged,
            "deleted_count": result.deleted_count
        })
    except Exception as e:
        print(f"Error deleting song: {e}")
        return jsonify({"error": "Failed to delete song"}), 500

# Users endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        db = get_db()
        users = list(db[USERS_COLLECTION].find())
        serialized_users = [serialize_doc(user) for user in users]
        return jsonify(serialized_users)
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500

@app.route('/api/users', methods=['POST'])
def add_user():
    try:
        user_data = request.json
        db = get_db()
        result = db[USERS_COLLECTION].insert_one(user_data)
        return jsonify({
            "acknowledged": result.acknowledged,
            "inserted_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        print(f"Error adding user: {e}")
        return jsonify({"error": "Failed to add user"}), 500

@app.route('/api/users/<id>', methods=['GET'])
def get_user(id):
    try:
        db = get_db()
        user = db[USERS_COLLECTION].find_one({"id": id})
        if user:
            return jsonify(serialize_doc(user))
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print(f"Error fetching user: {e}")
        return jsonify({"error": "Failed to fetch user"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        login_data = request.json
        db = get_db()
        user = db[USERS_COLLECTION].find_one({
            "email": login_data.get("email"),
            "password": login_data.get("password")
        })
        
        if user:
            return jsonify(serialize_doc(user))
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "Login failed"}), 500

# Liked Songs endpoints
@app.route('/api/likedSongs/<user_id>', methods=['GET'])
def get_liked_songs(user_id):
    try:
        db = get_db()
        # Find liked songs for specific user
        liked_songs = list(db[LIKED_SONGS_COLLECTION].find({"userId": user_id}))
        if not liked_songs:
            return jsonify([])  # Return empty array if no songs found
            
        serialized_songs = []
        for song in liked_songs:
            serialized_song = serialize_doc(song)
            # Ensure both _id and id are properly handled
            if 'id' not in serialized_song and '_id' in serialized_song:
                serialized_song['id'] = str(serialized_song['_id'])
            serialized_songs.append(serialized_song)
        return jsonify(serialized_songs)
    except Exception as e:
        print(f"Error fetching liked songs: {e}")
        return jsonify({"error": "Failed to fetch liked songs"}), 500

@app.route('/api/likedSongs', methods=['POST'])
def add_liked_song():
    try:
        song_data = request.json
        db = get_db()
        
        # Check if song already exists
        existing_song = db[LIKED_SONGS_COLLECTION].find_one({
            "id": song_data.get("id"),
            "userId": song_data.get("userId")
        })
        
        if existing_song:
            return jsonify({"message": "Song already liked"}), 409
            
        # Ensure required fields are present
        required_fields = ["id", "title", "artist", "genre", "audioUrl", "userId"]
        if not all(field in song_data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        result = db[LIKED_SONGS_COLLECTION].insert_one(song_data)
        return jsonify({
            "acknowledged": result.acknowledged,
            "inserted_id": str(result.inserted_id),
            "message": "Song added to liked songs"
        }), 201
    except Exception as e:
        print(f"Error adding liked song: {e}")
        return jsonify({"error": "Failed to add liked song"}), 500

@app.route('/api/likedSongs/<id>', methods=['DELETE'])
def remove_liked_song(id):
    try:
        db = get_db()
        # Try to delete by custom id first
        result = db[LIKED_SONGS_COLLECTION].delete_one({"id": id})
        
        if result.deleted_count == 0:
            # If no document was deleted, try with _id
            try:
                result = db[LIKED_SONGS_COLLECTION].delete_one({"_id": ObjectId(id)})
            except:
                pass
                
        if result.deleted_count > 0:
            return jsonify({
                "acknowledged": True,
                "deleted_count": result.deleted_count,
                "message": "Song removed from liked songs"
            })
        return jsonify({"error": "Song not found"}), 404
    except Exception as e:
        print(f"Error removing liked song: {e}")
        return jsonify({"error": "Failed to remove liked song"}), 500

# Playlists endpoints
@app.route('/api/playlists', methods=['GET'])
def get_playlists():
    try:
        db = get_db()
        playlists = list(db[PLAYLISTS_COLLECTION].find())
        serialized_playlists = [serialize_doc(playlist) for playlist in playlists]
        return jsonify(serialized_playlists)
    except Exception as e:
        print(f"Error fetching playlists: {e}")
        return jsonify({"error": "Failed to fetch playlists"}), 500

@app.route('/api/playlists/<id>', methods=['GET'])
def get_playlist(id):
    try:
        db = get_db()
        playlist = db[PLAYLISTS_COLLECTION].find_one({"id": id})
        if playlist:
            return jsonify(serialize_doc(playlist))
        return jsonify({"error": "Playlist not found"}), 404
    except Exception as e:
        print(f"Error fetching playlist: {e}")
        return jsonify({"error": "Failed to fetch playlist"}), 500

@app.route('/api/playlists', methods=['POST'])
def create_playlist():
    try:
        playlist_data = request.json
        db = get_db()
        result = db[PLAYLISTS_COLLECTION].insert_one(playlist_data)
        return jsonify({
            "acknowledged": result.acknowledged,
            "inserted_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        print(f"Error creating playlist: {e}")
        return jsonify({"error": "Failed to create playlist"}), 500

@app.route('/api/playlists/<id>', methods=['PUT'])
def update_playlist(id):
    try:
        playlist_data = request.json
        db = get_db()
        result = db[PLAYLISTS_COLLECTION].update_one(
            {"id": id},
            {"$set": playlist_data}
        )
        return jsonify({
            "acknowledged": result.acknowledged,
            "modified_count": result.modified_count
        })
    except Exception as e:
        print(f"Error updating playlist: {e}")
        return jsonify({"error": "Failed to update playlist"}), 500

@app.route('/api/playlists/<id>', methods=['DELETE'])
def delete_playlist(id):
    try:
        db = get_db()
        result = db[PLAYLISTS_COLLECTION].delete_one({"id": id})
        return jsonify({
            "acknowledged": result.acknowledged,
            "deleted_count": result.deleted_count
        })
    except Exception as e:
        print(f"Error deleting playlist: {e}")
        return jsonify({"error": "Failed to delete playlist"}), 500

@app.route('/api/playlists/<playlist_id>/songs/<song_id>', methods=['POST'])
def add_song_to_playlist(playlist_id, song_id):
    try:
        db = get_db()
        # Get the song to add
        song = db[SONGS_COLLECTION].find_one({"id": song_id})
        if not song:
            return jsonify({"error": "Song not found"}), 404
            
        # Remove _id field as it's not JSON serializable
        if "_id" in song:
            song.pop("_id")
            
        # Add song to playlist
        result = db[PLAYLISTS_COLLECTION].update_one(
            {"id": playlist_id},
            {"$push": {"songs": song}}
        )
        
        return jsonify({
            "acknowledged": result.acknowledged,
            "modified_count": result.modified_count
        })
    except Exception as e:
        print(f"Error adding song to playlist: {e}")
        return jsonify({"error": "Failed to add song to playlist"}), 500

@app.route('/api/playlists/<playlist_id>/songs/<song_id>', methods=['DELETE'])
def remove_song_from_playlist(playlist_id, song_id):
    try:
        db = get_db()
        result = db[PLAYLISTS_COLLECTION].update_one(
            {"id": playlist_id},
            {"$pull": {"songs": {"id": song_id}}}
        )
        
        return jsonify({
            "acknowledged": result.acknowledged,
            "modified_count": result.modified_count
        })
    except Exception as e:
        print(f"Error removing song from playlist: {e}")
        return jsonify({"error": "Failed to remove song from playlist"}), 500

# Search functionality
@app.route('/api/search', methods=['GET'])
def search():
    try:
        query = request.args.get('q', '').lower()
        if not query:
            return jsonify([]), 200
            
        db = get_db()
        songs = list(db[SONGS_COLLECTION].find({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"artist": {"$regex": query, "$options": "i"}},
                {"album": {"$regex": query, "$options": "i"}},
                {"genre": {"$regex": query, "$options": "i"}}
            ]
        }))
        
        serialized_songs = [serialize_doc(song) for song in songs]
        return jsonify(serialized_songs)
    except Exception as e:
        print(f"Error searching: {e}")
        return jsonify({"error": "Search failed"}), 500

# Genre-based filtering
@app.route('/api/songs/genre/<genre>', methods=['GET'])
def get_songs_by_genre(genre):
    try:
        db = get_db()
        songs = list(db[SONGS_COLLECTION].find({"genre": {"$regex": genre, "$options": "i"}}))
        serialized_songs = [serialize_doc(song) for song in songs]
        return jsonify(serialized_songs)
    except Exception as e:
        print(f"Error fetching songs by genre: {e}")
        return jsonify({"error": "Failed to fetch songs by genre"}), 500

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    app.run(port=5000, debug=True)