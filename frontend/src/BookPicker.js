import { useState } from 'react';

const BOOKS = [
  { name: "Genesis", code: "GEN", chapters: 50 },
  { name: "Exodus", code: "EXO", chapters: 40 },
  { name: "Leviticus", code: "LEV", chapters: 27 },
  { name: "Numbers", code: "NUM", chapters: 36 },
  { name: "Deuteronomy", code: "DEU", chapters: 34 },
  { name: "Joshua", code: "JOS", chapters: 24 },
  { name: "Judges", code: "JDG", chapters: 21 },
  { name: "Ruth", code: "RUT", chapters: 4 },
  { name: "1 Samuel", code: "1SA", chapters: 31 },
  { name: "2 Samuel", code: "2SA", chapters: 24 },
  { name: "1 Kings", code: "1KI", chapters: 22 },
  { name: "2 Kings", code: "2KI", chapters: 25 },
  { name: "1 Chronicles", code: "1CH", chapters: 29 },
  { name: "2 Chronicles", code: "2CH", chapters: 36 },
  { name: "Ezra", code: "EZR", chapters: 10 },
  { name: "Nehemiah", code: "NEH", chapters: 13 },
  { name: "Esther", code: "EST", chapters: 10 },
  { name: "Job", code: "JOB", chapters: 42 },
  { name: "Psalms", code: "PSA", chapters: 150 },
  { name: "Proverbs", code: "PRO", chapters: 31 },
  { name: "Ecclesiastes", code: "ECC", chapters: 12 },
  { name: "Song of Solomon", code: "SNG", chapters: 8 },
  { name: "Isaiah", code: "ISA", chapters: 66 },
  { name: "Jeremiah", code: "JER", chapters: 52 },
  { name: "Lamentations", code: "LAM", chapters: 5 },
  { name: "Ezekiel", code: "EZK", chapters: 48 },
  { name: "Daniel", code: "DAN", chapters: 12 },
  { name: "Hosea", code: "HOS", chapters: 14 },
  { name: "Joel", code: "JOL", chapters: 3 },
  { name: "Amos", code: "AMO", chapters: 9 },
  { name: "Obadiah", code: "OBA", chapters: 1 },
  { name: "Jonah", code: "JON", chapters: 4 },
  { name: "Micah", code: "MIC", chapters: 7 },
  { name: "Nahum", code: "NAM", chapters: 3 },
  { name: "Habakkuk", code: "HAB", chapters: 3 },
  { name: "Zephaniah", code: "ZEP", chapters: 3 },
  { name: "Haggai", code: "HAG", chapters: 2 },
  { name: "Zechariah", code: "ZEC", chapters: 14 },
  { name: "Malachi", code: "MAL", chapters: 4 },
  { name: "Matthew", code: "MAT", chapters: 28 },
  { name: "Mark", code: "MRK", chapters: 16 },
  { name: "Luke", code: "LUK", chapters: 24 },
  { name: "John", code: "JHN", chapters: 21 },
  { name: "Acts", code: "ACT", chapters: 28 },
  { name: "Romans", code: "ROM", chapters: 16 },
  { name: "1 Corinthians", code: "1CO", chapters: 16 },
  { name: "2 Corinthians", code: "2CO", chapters: 13 },
  { name: "Galatians", code: "GAL", chapters: 6 },
  { name: "Ephesians", code: "EPH", chapters: 6 },
  { name: "Philippians", code: "PHP", chapters: 4 },
  { name: "Colossians", code: "COL", chapters: 4 },
  { name: "1 Thessalonians", code: "1TH", chapters: 5 },
  { name: "2 Thessalonians", code: "2TH", chapters: 3 },
  { name: "1 Timothy", code: "1TI", chapters: 6 },
  { name: "2 Timothy", code: "2TI", chapters: 4 },
  { name: "Titus", code: "TIT", chapters: 3 },
  { name: "Philemon", code: "PHM", chapters: 1 },
  { name: "Hebrews", code: "HEB", chapters: 13 },
  { name: "James", code: "JAS", chapters: 5 },
  { name: "1 Peter", code: "1PE", chapters: 5 },
  { name: "2 Peter", code: "2PE", chapters: 3 },
  { name: "1 John", code: "1JN", chapters: 5 },
  { name: "2 John", code: "2JN", chapters: 1 },
  { name: "3 John", code: "3JN", chapters: 1 },
  { name: "Jude", code: "JUD", chapters: 1 },
  { name: "Revelation", code: "REV", chapters: 22 }
];

const containerStyle = {
  minHeight: '100vh',
  background: '#0a0a0a',
  color: '#f0ece4',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '60px 20px 40px',
  fontFamily: 'Georgia, serif'
};

const titleStyle = {
  fontWeight: 300,
  letterSpacing: '0.1em',
  marginBottom: '8px',
  fontSize: '1.3rem'
};

const subtitleStyle = {
  opacity: 0.5,
  fontSize: '0.85rem',
  marginBottom: '24px',
  letterSpacing: '0.05em'
};

const btnStyle = {
  padding: '12px 8px',
  background: 'transparent',
  border: '1px solid rgba(240,236,228,0.15)',
  color: '#f0ece4',
  fontSize: '0.85rem',
  cursor: 'pointer',
  borderRadius: '2px',
  fontFamily: 'Georgia, serif',
  letterSpacing: '0.03em',
  transition: 'all 0.2s'
};

const backBtnStyle = {
  marginTop: '32px',
  padding: '10px 28px',
  background: 'transparent',
  border: '1px solid rgba(240,236,228,0.2)',
  color: 'rgba(240,236,228,0.5)',
  cursor: 'pointer',
  borderRadius: '2px',
  fontFamily: 'Georgia, serif',
  fontSize: '0.85rem',
  letterSpacing: '0.05em'
};

function BookPicker({ onSelect }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = BOOKS.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const hover = e => e.target.style.background = 'rgba(240,236,228,0.08)';
  const unhover = e => e.target.style.background = 'transparent';

  return (
    <div style={containerStyle}>
      {!selectedBook ? (
        <>
          <h2 style={titleStyle}>Choose a book</h2>
          <p style={subtitleStyle}>Selah will walk you through it, one moment at a time</p>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid rgba(240,236,228,0.2)',
              color: '#f0ece4',
              fontSize: '0.9rem',
              borderRadius: '2px',
              marginBottom: '24px',
              outline: 'none',
              fontFamily: 'Georgia, serif'
            }}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            width: '100%',
            maxWidth: '500px',
            overflowY: 'auto',
            maxHeight: '60vh'
          }}>
            {filtered.map(book => (
              <button
                key={book.code}
                onClick={() => setSelectedBook(book)}
                style={btnStyle}
                onMouseEnter={hover}
                onMouseLeave={unhover}
              >
                {book.name}
              </button>
            ))}
          </div>
        </>
      ) : !selectedChapter ? (
        <>
          <h2 style={titleStyle}>{selectedBook.name}</h2>
          <p style={subtitleStyle}>Which chapter would you like to start from?</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '8px',
            maxWidth: '500px',
            width: '100%'
          }}>
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChapter(ch)}
                style={btnStyle}
                onMouseEnter={hover}
                onMouseLeave={unhover}
              >
                {ch}
              </button>
            ))}
          </div>
          <button style={backBtnStyle} onClick={() => setSelectedBook(null)}>← Back</button>
        </>
      ) : (
        <>
          <h2 style={titleStyle}>{selectedBook.name} {selectedChapter}</h2>
          <p style={subtitleStyle}>How many verses per Selah moment?</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            maxWidth: '400px',
            width: '100%'
          }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => onSelect(selectedBook, selectedChapter, n)}
                style={{ ...btnStyle, padding: '16px 8px', fontSize: '1rem' }}
                onMouseEnter={hover}
                onMouseLeave={unhover}
              >
                {n}
              </button>
            ))}
          </div>
          <button style={backBtnStyle} onClick={() => setSelectedChapter(null)}>← Back</button>
        </>
      )}
    </div>
  );
}

export default BookPicker;