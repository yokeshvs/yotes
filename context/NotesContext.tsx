import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Note {
    id: string;
    content: string;
    date: string;
    color: string;
    tags: string[];
    title: string;
    isPinned?: boolean;
}

interface NotesContextType {
    notes: Note[];
    addNote: (note: Omit<Note, 'id' | 'date'>) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    deleteNotes: (ids: string[]) => void;
    togglePin: (id: string) => void;
    clearAllNotes: () => void;
    allTags: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

/**
 * NotesContext
 * 
 * Manages the global state of user notes, including creation, updates, and deletion.
 * - Persistence: Automatically saves notes to AsyncStorage whenever they change.
 * - Search: Exposure of shared search query state.
 * - Tags: Derives a list of all unique tags from the current notes.
 */
const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const MOCK_NOTES_INITIAL: Note[] = [];

export function NotesProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadNotes = async () => {
            try {
                const saved = await AsyncStorage.getItem('savedNotes');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Validate notes to filter out corrupted data (e.g. from previous bugs)
                    const validNotes = Array.isArray(parsed) ? parsed.filter(n => n && typeof n === 'object' && n.id && n.title !== undefined) : [];
                    setNotes(validNotes);
                }
            } catch (e) {
                console.error("Failed to load notes", e);
            }
        };
        loadNotes();
    }, []);

    useEffect(() => {
        const saveNotes = async () => {
            try {
                await AsyncStorage.setItem('savedNotes', JSON.stringify(notes));
            } catch (e) {
                console.error("Failed to save notes", e);
            }
        };
        saveNotes();
    }, [notes]);

    const addNote = (newNoteData: Omit<Note, 'id' | 'date'>) => {
        const newNote: Note = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            ...newNoteData
        };
        setNotes((prev) => [newNote, ...prev]);
    };

    const updateNote = (id: string, updates: Partial<Note>) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    const deleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    const deleteNotes = (ids: string[]) => {
        setNotes(prev => prev.filter(n => !ids.includes(n.id)));
    };

    const togglePin = (id: string) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    };

    const clearAllNotes = async () => {
        try {
            await AsyncStorage.removeItem('savedNotes');
            setNotes([]);
        } catch (e) {
            console.error("Failed to clear notes", e);
        }
    };

    // Safe Tag Extraction
    const allTags = ['All', ...Array.from(new Set(
        notes.flatMap(n => Array.isArray(n.tags) ? n.tags : [])
            .filter(tag => tag && typeof tag === 'string' && tag.trim() !== '')
    )).sort()];

    return (
        <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, deleteNotes, togglePin, clearAllNotes, allTags, searchQuery, setSearchQuery }}>
            {children}
        </NotesContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error('useNotes must be used within a NotesProvider');
    }
    return context;
}
