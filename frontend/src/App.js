import { useState, useEffect } from 'react';
import './App.css';
import BookPicker from './BookPicker';

const API = 'https://selah-vx3l.onrender.com';

function App() {
  const videos = ['video1.mp4', 'video2.mp4', 'video3.mp4', 'video4.mp4', 'video5.mp4', 'video6.mp4', 'video7.mp4', 'video8.mp4', 'video9.mp4'];
  const musicTracks = ['music1.mp3', 'music2.mp3', 'music3.mp3', 'music4.mp3', 'music5.mp3'];

  const [showSelah, setShowSelah] = useState(false);
  const [verse, setVerse] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [currentEvent, setCurrentEvent] = useState("your session");
  const [mode, setMode] = useState(null);
  const [journeyBook, setJourneyBook] = useState('');
  const [journeyChapter, setJourneyChapter] = useState(1);
  const [journeyVerse, setJourneyVerse] = useState(1);
  const [versesPerMoment, setVersesPerMoment] = useState(1);
  const [currentVideo, setCurrentVideo] = useState('video1.mp4');
  const [currentMusic, setCurrentMusic] = useState('music1.mp3');

  useEffect(() => {
    const saved = localStorage.getItem('selah_token');
    if (saved) setAccessToken(saved);

    const savedMode = localStorage.getItem('selah_mode');
    if (savedMode) setMode(savedMode);

    const savedBook = localStorage.getItem('selah_book');
    if (savedBook) setJourneyBook(savedBook);

    const savedChapter = localStorage.getItem('selah_chapter');
    if (savedChapter) setJourneyChapter(parseInt(savedChapter));

    const savedVerse = localStorage.getItem('selah_verse');
    if (savedVerse) setJourneyVerse(parseInt(savedVerse));

    const savedCount = localStorage.getItem('selah_verses');
    if (savedCount) setVersesPerMoment(parseInt(savedCount));

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setAccessToken(token);
      localStorage.setItem('selah_token', token);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      fetch(`${API}/calendar/check?access_token=${accessToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.event_ended) {
            setCurrentEvent(data.event_name);
            setShowSelah(true);
          }
        });
    }, 60000);
    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    if (showSelah) {
      const verseUrl = mode === 'journey'
        ? `${API}/verse?book=${journeyBook}&chapter=${journeyChapter}&start=${journeyVerse}&count=${versesPerMoment}`
        : `${API}/verse`;

      fetch(verseUrl)
        .then(res => res.json())
        .then(data => setVerse(data));

      fetch(`${API}/reflection?event=${currentEvent}`)
        .then(res => res.json())
        .then(data => {
          setReflection(data.reflection);
        })
        .catch(err => console.log("REFLECTION ERROR:", err));
    }
  }, [showSelah]);

  const playAudio = () => {
    setTimeout(() => {
      const audio = document.getElementById('selah-audio');
      if (audio) {
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
    }, 100);
  };

  useEffect(() => {
    const audio = document.getElementById('selah-audio');
    if (!showSelah && audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [showSelah]);

  const handleConnect = () => {
    fetch(`${API}/auth/login`)
      .then(res => res.json())
      .then(data => {
        window.location.href = data.auth_url;
      });
  };

  const closeSelah = () => {
    setShowSelah(false);
    setVerse(null);
    setReflection(null);
    if (mode === 'journey') {
      const nextVerse = journeyVerse + versesPerMoment;
      setJourneyVerse(nextVerse);
      localStorage.setItem('selah_verse', nextVerse);
    }
    setCurrentVideo(videos[Math.floor(Math.random() * videos.length)]);
    setCurrentMusic(musicTracks[Math.floor(Math.random() * musicTracks.length)]);
  };

  const openSettings = () => {
    localStorage.removeItem('selah_mode');
    localStorage.removeItem('selah_book');
    localStorage.removeItem('selah_chapter');
    localStorage.removeItem('selah_verse');
    localStorage.removeItem('selah_verses');
    setMode(null);
    setJourneyBook('');
    setJourneyChapter(1);
    setJourneyVerse(1);
  };

  return (
    <div>
      {showSelah ? (
        <div className="selah-screen">
          <video autoPlay loop muted playsInline className="background-video">
            <source src={`/${currentVideo}`} type="video/mp4" />
          </video>
          <audio id="selah-audio" loop>
            <source src={`/${currentMusic}`} type="audio/mpeg" />
          </audio>
          <div className="overlay"></div>
          <div className="selah-content">
            <p className="verse">{verse ? verse.content : "Loading..."}</p>
            <p className="reference">{verse ? verse.reference : ""}</p>
            <p className="reflection">{reflection ? reflection : "..."}</p>
            <button onClick={closeSelah}>Return</button>
          </div>
        </div>
      ) : !accessToken ? (
        <div className="prompt-screen">
          <h2>Connect your calendar to begin your Selah journey</h2>
          <button onClick={handleConnect}>Connect Google Calendar</button>
        </div>
      ) : !mode ? (
        <div className="prompt-screen">
          <h2>How would you like your Selah moments?</h2>
          <button onClick={() => {
            setMode('daily');
            localStorage.setItem('selah_mode', 'daily');
          }}>Daily Word</button>
          <button onClick={() => {
            setMode('journey');
            localStorage.setItem('selah_mode', 'journey');
          }}>Journey through a book</button>
        </div>
      ) : mode === 'journey' && !journeyBook ? (
        <BookPicker onSelect={(book, chapter, verses) => {
          setJourneyBook(book.code);
          setJourneyChapter(chapter);
          setJourneyVerse(1);
          setVersesPerMoment(verses);
          localStorage.setItem('selah_book', book.code);
          localStorage.setItem('selah_chapter', chapter);
          localStorage.setItem('selah_verse', 1);
          localStorage.setItem('selah_verses', verses);
        }} />
      ) : (
        <div className="prompt-screen">
          <h2>Your session just ended. Take a Selah moment?</h2>
          <button onClick={() => {
            setShowSelah(true);
            playAudio();
          }}>Yes</button>
          <button onClick={closeSelah}>Not now</button>
          <button className="settings-btn" onClick={openSettings}>⚙ Change Mode</button>
        </div>
      )}
    </div>
  );
}

export default App;