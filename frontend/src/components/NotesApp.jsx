import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';   
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const loadNotes = async () => {
    try {
      const res = await api.get('/notes?page=1&limit=10');
      setNotes(res.data);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  useEffect(() => {
  if (!token) return; 
  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes?page=1&limit=10');
      setNotes(res.data);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };
  fetchNotes();
}, [token]);


  const saveNote = async () => {
    if (!title || !content) return;
    try {
      if (editingId) {
        await api.put(`/notes/${editingId}`, { title, content, tags });
        setEditingId(null);
      } else {
        await api.post('/notes', { title, content, tags });
      }
      setTitle('');
      setTags('');
      await loadNotes();
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      await loadNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const searchNotes = async () => {
    try {
      const res = await api.get(`/search?q=${search}`);
      setNotes(res.data);
    } catch (err) {
      console.error('Error searching notes:', err);
    }
  };

  const signup = async () => {
    try {
      await axios.post('http://localhost:5000/signup', { username, password });
      alert('Signup successful, now login.');
    } catch (err) {
      alert('Signup failed: ' + err.response?.data?.error);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5000/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert('Login failed: ' + err.response?.data?.error);
    }
  };

  return (
    <div className={`${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 flex flex-col justify-content-center'} min-h-screen p-6`}>
      <h1 className="text-3xl font-bold text-center mb-6">Markdown Notes App</h1>

      {!token && (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h3 className=" text-white text-xl font-semibold mb-4">Login / Signup</h3>
          <input className="w-full p-2 border rounded mb-3 bg-white text-black dark:bg-gray-700 dark:text-white"
                 placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="w-full p-2 border rounded mb-3 bg-white text-black dark:bg-gray-700 dark:text-white"
                 type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex gap-3">
            <button className=" bg-blue-600 text-white px-4 py-2 rounded" onClick={signup}>Signup</button>
            <button className=" bg-green-600 text-white px-4 py-2 rounded" onClick={login}>Login</button>
          </div>
        </div>
      )}

      {token && (
        <>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => setDark(!dark)}>Toggle Dark Mode</button>
            <input className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white"
                   placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={searchNotes}>Search</button>
            <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => {
            localStorage.removeItem('token'); 
            setToken('');                      
            }}
            >
           Logout
           </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-3 text-white">Editor</h2>
              <input className="w-full p-2 border rounded mb-3 bg-white text-black dark:bg-gray-700 dark:text-white"
                     placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea className="w-full p-2 border rounded mb-3 bg-white text-black dark:bg-gray-700 dark:text-white"
                        rows="8" value={content} onChange={e => setContent(e.target.value)} />
              <input className="w-full p-2 border rounded mb-3 bg-white text-black dark:bg-gray-700 dark:text-white"
                     placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={saveNote}>Save</button>
            </div>

            {/* Preview */}
            <div className="border p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h2 className="text-lg font-semibold mb-3 text-white">Preview</h2>
              <div className="text-gray-900 dark:text-gray-100 space-y-2">
                <ReactMarkdown
                  children={content}
                  components={{
                    code({inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="border p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h2 className="text-lg font-semibold mb-3 text-white">Notes List</h2>
              {notes.map(note => (
                <div key={note.id} className="border-b border-gray-300 dark:border-gray-600 pb-3 mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{note.title}</h4>
                  <div className="text-gray-800 dark:text-gray-200 space-y-2">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tags: {note.tags}</p>
                  <div className="flex gap-3 mt-2">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mt-2"
                          onClick={() => deleteNote(note.id)}>Delete</button>
                  
                  <button className="bg-green-600 text-white px-2 py-1 rounded mt-2"
                    onClick={() => { setTitle(note.title);
                                     setContent(note.content);
                                     setTags(note.tags);
                                     setEditingId(note.id); 
                                    }}
                                   >
                              Edit
                        </button>
                 </div>       
                </div>

              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
