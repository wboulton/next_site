"use client"

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useRouter } from 'next/router';
import './App.css';
import ReactMarkdown from 'react-markdown';
// import { redirect } from 'next/dist/server/api-utils';

function About() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px', marginTop: '30px' }}>
      <h1>About Me</h1>
      <p style={{ width: '800px', textAlign: 'center' }}>
        My name is William Boulton. I am a freshman at Purdue University in West Lafayette, Indiana studying computer science with
        a focus on cybersecurity. I am interested in CTFs and offensive security, particularly the reverse engineering category.
      </p>
      <p>Contact me using williamdboulton@gmail.com.</p>

      <h2>Links</h2>
      <p>
        LinkedIn: <a href="https://www.linkedin.com/in/william-boulton-a958832ba/" target="_blank" rel="noopener noreferrer">William Boulton</a>
      </p>
      <p>
        Github: <a href="https://github.com/wboulton" target="_blank" rel="noopener noreferrer">wboulton</a>
      </p>
    </div>
  );
}

// Writeups List Component
function Writeups() {
  const writeups = [
    { name: 'DeadFace 2024 DaCube', link: '/writeups/DeadFace 2024 DaCube' },
    { name: 'Bearcat World Tour 2025', link: '/writeups/Bearcat World Tour 2025' },
    
  ];

  return (
    <div style={{ margin: '20px', marginTop: '30px', textAlign: 'center' }}>
      <h1>Writeups</h1>
      <ul style={{ listStyleType: 'none', padding: 0, fontSize: '25px' }}>
      {writeups.map((writeup, index) => (
        <li key={index}>
        <Link to={writeup.link}>{writeup.name}</Link>
        </li>
      ))}
      </ul>
    </div>
  );
}

// Writeup Detail Component
function WriteupDetail() {
  const { id } = useParams(); // Retrieve the writeup ID from the URL
  const [content, setContent] = useState('');

  useEffect(() => {
    // Fetch the markdown file dynamically
    fetch(`/writeups/${id}.md`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Markdown file not found');
        }
        return response.text();
      })
      .then((text) => setContent(text))
      .catch((error) => setContent(`# Error\n\n${error.message}`));
  }, [id]);

  return (
    <div style={{ margin: '20px', marginTop: '30px', textAlign: 'left' }}>
      <h1>{(id || '').replace(/-/g, ' ')}</h1>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

function Other() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('/Dog/images.json')
      .then((response) => response.json())
      .then((data) => {console.log(data); setImages(data);})
      .catch((error) => console.error('Error fetching images:', error));
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Doggo</h1>
      <p style={{ textAlign: 'center' }}>just some pictures of my dog for now</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={`/Dog/${image}`}
            alt={`Dog ${index}`}
            style={{ width: '200px', height: '200px', objectFit: 'cover', margin: '10px' }}
          />
        ))}
      </div>
    </div>
  );
}
const Home = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/about');
  }, [navigate]);

  return null;
};

const App = () => {
  return (
    <Router>
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '10px', color: 'white', position: 'fixed', top: '0', left: '0', width: '100%', zIndex: '1', backgroundColor: '#333' }}>
          <Link to="/about" style={{ textDecoration: 'none' }}>
            <button style={{ margin: '0 10px', padding: '10px 20px', backgroundColor: '#7f6b00', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              About
            </button>
          </Link>
          <Link to="/writeups" style={{textDecoration: 'none'}}>
            <button style={{ margin: '0 10px', padding: '10px 20px', backgroundColor: '#7f6b00', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Writeups
            </button>
          </Link>
          <Link to="/other" style={{textDecoration: 'none'}}>
            <button style={{ margin: '0 10px', padding: '10px 20px', backgroundColor: '#7f6b00', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Other
            </button>
          </Link>
          
        </div>
        <div style={{ marginTop: '60px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/other" element={<Other />} />
            <Route path="/writeups" element={<Writeups />} />
            <Route path="/writeups/:id" element={<WriteupDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
