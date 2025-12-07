import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Note {
    id: string;
    content: string;
    date: string;
    color: string;
    tags: string[];
    title: string;
}

interface NotesContextType {
    notes: Note[];
    addNote: (note: Omit<Note, 'id' | 'date'>) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    allTags: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const MOCK_NOTES_INITIAL: Note[] = [
    { id: '1', title: 'Start of a new journey', date: '6th Dec 2025', content: "Just setting up my new notes app. #Personal #Ideas", color: '#e9d5ff', tags: ['#Personal', '#Ideas'] },
    { id: '2', title: 'Work Meeting', date: '6th Dec 2025', content: "Discussing Q1 goals and glassmorphism designs. #work", color: '#d9f99d', tags: ['#work'] },
];

export function NotesProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadNotes = async () => {
            try {
                const saved = await AsyncStorage.getItem('savedNotes');
                if (saved) {
                    setNotes(JSON.parse(saved));
                } else {
                    setNotes(MOCK_NOTES_INITIAL);
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
        if (notes.length > 0) {
            saveNotes();
        }
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

    const allTags = ['#All', ...Array.from(new Set(notes.flatMap(n => n.tags)))];

    return (
        <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, allTags, searchQuery, setSearchQuery }}>
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
