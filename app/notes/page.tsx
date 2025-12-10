'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TrashIcon as TrashIconSolid } from '@heroicons/react/24/solid';

interface StickyNote {
  id: string;
  content: string;
  author: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
  createdAt: string;
}

const COLORS = [
  { name: 'Yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', shadow: 'shadow-yellow-200' },
  { name: 'Pink', bg: 'bg-pink-200', border: 'border-pink-300', shadow: 'shadow-pink-200' },
  { name: 'Blue', bg: 'bg-blue-200', border: 'border-blue-300', shadow: 'shadow-blue-200' },
  { name: 'Green', bg: 'bg-green-200', border: 'border-green-300', shadow: 'shadow-green-200' },
  { name: 'Purple', bg: 'bg-purple-200', border: 'border-purple-300', shadow: 'shadow-purple-200' },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', author: '', color: 0 });
  const [mounted, setMounted] = useState(false);
  const [selectedNote, setSelectedNote] = useState<StickyNote | null>(null);

  // Fetch notes from database
  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Fetch notes from database
    fetchNotes();

    // Mark all notes as read when visiting the page
    localStorage.setItem('lastNotesVisit', new Date().toISOString());
  }, []);

  const getRandomRotation = () => {
    return Math.random() * 10 - 5; // -5 to 5 degrees
  };

  const handleAddNote = async () => {
    if (!newNote.content.trim() || !newNote.author.trim()) return;

    const note: StickyNote = {
      id: Date.now().toString(),
      content: newNote.content,
      author: newNote.author,
      color: COLORS[newNote.color].name,
      x: 0, // Not used anymore but keeping for DB compatibility
      y: 0, // Not used anymore but keeping for DB compatibility
      rotation: getRandomRotation(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      if (response.ok) {
        // Optimistically update UI
        setNotes([...notes, note]);
        setNewNote({ content: '', author: '', color: 0 });
        setIsAddingNote(false);
        // Fetch latest from server
        fetchNotes();
      } else {
        // Log detailed error
        const errorData = await response.json();
        console.error('Error adding note:', errorData);
        alert(`Failed to create note: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Network error: Could not connect to server');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      // Optimistically update UI
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);

      // Delete from database
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert on error
        fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      // Revert on error
      fetchNotes();
    }
  };


  const getColorClasses = (colorName: string) => {
    const color = COLORS.find(c => c.name === colorName) || COLORS[0];
    return color;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
              Our Sticky Notes
            </h1>
            <p className="text-slate-600">
              Leave sweet messages for each other
            </p>
          </div>

          <motion.button
            onClick={() => setIsAddingNote(true)}
            className="flex items-center justify-center md:gap-2 px-3 py-3 md:px-6 bg-slate-800 text-white rounded-full hover:bg-slate-900 shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden md:inline">Add Note</span>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-slate-600 text-sm">
            <span className="font-bold text-slate-900">{notes.length}</span> {notes.length === 1 ? 'note' : 'notes'} on the board
          </p>
        </div>
      </motion.div>

      {/* Add Note Modal */}
      {isAddingNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddingNote(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">New Sticky Note</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={newNote.author}
                  onChange={(e) => setNewNote({ ...newNote, author: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="e.g., Ansaa, You, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Write your message..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Note Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => setNewNote({ ...newNote, color: index })}
                      className={`w-10 h-10 rounded-full ${color.bg} border-2 ${
                        newNote.color === index ? 'border-slate-900 scale-110' : 'border-slate-300'
                      } transition-all`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                  disabled={!newNote.content.trim() || !newNote.author.trim()}
                >
                  Add Note
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Sticky Notes Board */}
      <div className="max-w-7xl mx-auto">
        {notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <p className="text-slate-400 text-lg mb-4">No notes yet!</p>
              <p className="text-slate-500 text-sm">Click "Add Note" to get started</p>
            </div>
          </motion.div>
        )}

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-auto">
          {notes.map((note, index) => {
            const colorClasses = getColorClasses(note.color);
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: note.rotation,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 100 }}
                onClick={() => setSelectedNote(note)}
                className={`group relative w-full aspect-square ${colorClasses.bg} ${colorClasses.border} border-2 rounded-sm shadow-lg cursor-pointer p-6 transition-all hover:shadow-2xl`}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="delete-btn absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-all z-10 group/delete"
                  title="Delete note"
                >
                  <TrashIcon className="w-5 h-5 text-gray-600 group-hover/delete:hidden transition-colors" />
                  <TrashIconSolid className="w-5 h-5 text-red-500 hidden group-hover/delete:block" />
                </button>

                {/* Note content */}
                <div className="h-full flex flex-col">
                  <p className="flex-1 text-gray-900 text-sm leading-relaxed overflow-hidden line-clamp-6">
                    {note.content}
                  </p>

                  <div className="border-t border-gray-400 pt-2 mt-2">
                    <p className="text-xs text-gray-700 font-medium">— {note.author}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Tape effect */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-slate-200/50 rotate-0" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Note Modal */}
      {selectedNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNote(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className={`${getColorClasses(selectedNote.color).bg} ${getColorClasses(selectedNote.color).border} border-4 rounded-sm shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tape effect */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-slate-200/50 rotate-0" />

            {/* Note content */}
            <div className="flex flex-col min-h-[300px]">
              <p className="flex-1 text-gray-900 text-lg leading-relaxed whitespace-pre-wrap break-words mb-6">
                {selectedNote.content}
              </p>

              <div className="border-t-2 border-gray-400 pt-4 mt-4">
                <p className="text-base text-gray-700 font-medium">— {selectedNote.author}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(selectedNote.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-800/10 hover:bg-gray-800/20 rounded-full transition-colors"
            >
              <span className="text-gray-700 text-xl font-bold">×</span>
            </button>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
