import { useState, useEffect } from 'react';
import './App.css';
import BookPicker from './BookPicker';

const API = 'https://selah-vx3l.onrender.com';

function App() {
  const videos = ['video3.mp4', 'video5.mp4', 'video8.mp4', 'sunset.mp4'];
  const musicTracks = ['music1.mp3', 'music2.mp3', 'music3.mp3', 'music4.mp3', 'music5.mp3'];

  const [showSelah, setShowSelah] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [verse, setVerse] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [eventJustEnded, setEventJustEnded] = useState(false);
  const [currentEvent, setCurrentEvent] = useState("your session");
  const [mode, setMode] = useState(null);
  const [journeyBook, setJourneyBook] = useState('');
  const [journeyChapter, setJourneyChapter] = useState(1);
  const [journeyVerse, setJourneyVerse] = useState(1);
  const [versesPerMoment, setVersesPerMoment] = useState(1);
  const [currentVideo, setCurrentVideo] = useState('sunset.mp4');
  const [currentMusic, setCurrentMusic] = useState('music1.mp3');
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

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
    const refresh = params.get('refresh');
    if (token) {
      setAccessToken(token);
      localStorage.setItem('selah_token', token);
      if (refresh) localStorage.setItem('selah_refresh', refresh);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const registration = await navigator.serviceWorker.ready;
    const keyRes = await fetch(`${API}/push/vapid-public-key`);
    const { key } = await keyRes.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key
    });

    const refreshToken = localStorage.getItem('selah_refresh');
    await fetch(`${API}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken, subscription })
    });
  };

  useEffect(() => {
    if (accessToken) {
      subscribeToPush();
    }
  }, [accessToken]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      new Notification('Selah notifications enabled', {
        body: 'Selah will remind you when it is time to pause.',
        icon: '/logo192.png',
      });
    }
  };

  const sendSelahNotification = (eventName) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const notification = new Notification('Take a Selah moment', {
        body: `${eventName} just ended. Pause, breathe, and reflect.`,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'selah-moment',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        setShowSelah(true);
      };
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      const refreshToken = localStorage.getItem('selah_refresh');
      fetch(`${API}/calendar/check?access_token=${accessToken}&refresh_token=${refreshToken || ''}`)
        .then(res => res.json())
        .then(data => {
          if (data.new_access_token && data.new_access_token !== accessToken) {
            setAccessToken(data.new_access_token);
            localStorage.setItem('selah_token', data.new_access_token);
          }
          if (data.event_ended) {
            setCurrentEvent(data.event_name);
            setEventJustEnded(true);
            console.log("EVENT ENDED, CALLING NOTIFICATION:", data.event_name, "Permission:", Notification.permission);
            sendSelahNotification(data.event_name);
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
    setEventJustEnded(false);
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
      {showSettings ? (
        <div className="prompt-screen">
          <h2>Settings</h2>
          <button onClick={() => {
            setShowSettings(false);
            openSettings();
          }}>Change Mode (Daily / Journey)</button>
          <button onClick={() => {
            localStorage.clear();
            setAccessToken(null);
            setDemoMode(false);
            setMode(null);
            setShowSettings(false);
          }}>Disconnect Calendar</button>
          <button onClick={() => {
            setShowSettings(false);
            setDemoMode(true);
            setCurrentEvent("Your study session");
            setEventJustEnded(true);
          }}>Try Demo Again</button>
          <button className="settings-btn" onClick={() => setShowSettings(false)}>← Back</button>
        </div>
      ) : showSelah ? (
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
      ) : !accessToken && !demoMode ? (
        <div className="prompt-screen">
          <img src="/logo.png" alt="Selah" className="welcome-logo" />
          <h2>Selah brings Scripture into the quiet moments after your classes, meetings, and work sessions.</h2>
          <button onClick={handleConnect}>Connect Google Calendar</button>
          <button onClick={() => {
            setDemoMode(true);
            setCurrentEvent("Your study session");
            setEventJustEnded(true);
          }}>Try Demo Mode</button>
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
          <h2>{eventJustEnded
            ? `${currentEvent} just ended. Take a Selah moment?`
            : "Selah is watching over your day. Your next moment will find you."}</h2>
          {eventJustEnded && (
            <button onClick={() => {
              setShowSelah(true);
              playAudio();
            }}>Yes</button>
          )}
          {eventJustEnded && <button onClick={closeSelah}>Not now</button>}
          {!eventJustEnded && (
            <button onClick={() => {
              setEventJustEnded(true);
              setCurrentEvent("your session");
            }}>Take a Selah moment now</button>
          )}
          {notificationPermission !== 'granted' && (
            <button onClick={enableNotifications}>Enable Selah Notifications</button>
          )}
          <button onClick={() => sendSelahNotification("Manual Test Event")}>Test Notification Function</button>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>⚙ Settings</button>
        </div>
      )}
    </div>
  );
}

export default App;