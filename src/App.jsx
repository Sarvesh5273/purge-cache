import React, { useState } from 'react';
import './App.css';

function App() {
  const [worry, setWorry] = useState('');
  const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, PURGED
  const [response, setResponse] = useState(null);
  const [themeColor, setThemeColor] = useState('#33ff00'); // Default Green

  // Access the key safely from Vite environment variables
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handlePurge = async () => {
    if (!worry) return;
    
    setStatus('PROCESSING');
    
    // The "Vibe" System Prompt - This gives the app its personality
    const systemPrompt = `
      Persona: You are "The Core," a stoic, futuristic Operating System. 
      You do not use markdown. You return ONLY raw JSON.
      
      Task: Analyze this user's worry: "${worry}"
      
      Output JSON format:
      {
        "load": "XX%", (Estimate mental CPU load based on stress level)
        "patch": "A single, poetic, stoic sentence that reframes the worry.",
        "color": "HEXCODE" (Red #ff5555 for anger, Blue #55aaff for sadness, Purple #aa55ff for anxiety)
      }
    `;

    try {
      // Direct call to Gemini 1.5 Flash (Fastest model for Hackathons)
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });
      
      const rawData = await res.json();
      
      // Extract and clean the AI response
      if (rawData.candidates && rawData.candidates[0].content) {
        let textResponse = rawData.candidates[0].content.parts[0].text;
        
        // Remove code blocks if the AI adds them (e.g. ```json )
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const data = JSON.parse(textResponse);
        
        // Success: Update State
        setResponse(data); 
        if (data.color) setThemeColor(data.color);
      
        // Trigger Purge Animation delay
        setTimeout(() => {
          setStatus('PURGED');
          setWorry(''); 
        }, 1500); // 1.5s delay to let the glitch effect play
      } else {
        throw new Error("Invalid AI Response");
      }

    } catch (error) {
      console.error("System Failure", error);
      // Fallback in case of API error (so the demo never breaks!)
      setResponse({
        load: "ERR_404",
        patch: "System connection unstable. Release the outcome regardless.",
        color: "#ff0000"
      });
      setTimeout(() => {
        setStatus('PURGED');
        setWorry('');
      }, 1500);
    }
  };

  return (
    <>
      <div className="scanlines"></div>
      
      <div 
        className="terminal-container" 
        style={{ 
          borderColor: themeColor, 
          boxShadow: `0 0 20px ${themeColor}40`,
          color: themeColor
        }}
      >
        {status === 'IDLE' && (
          <div className="fade-in">
            <p className="system-text">system@mind:~$ ./init_purge_sequence</p>
            <h1 className="title">// PURGE_CACHE</h1>
            <p>Identify corrupted memory segment:</p>
            <input 
              autoFocus
              type="text" 
              value={worry} 
              onChange={(e) => setWorry(e.target.value)}
              placeholder="Type your worry here..."
              onKeyDown={(e) => e.key === 'Enter' && handlePurge()}
              style={{ color: themeColor, borderBottomColor: themeColor }}
            />
            <button 
              onClick={handlePurge} 
              style={{ color: themeColor, borderColor: themeColor }}
            >
              [ EXECUTE DELETE ]
            </button>
          </div>
        )}

        {status === 'PROCESSING' && (
          <div className="glitch-container" style={{ color: themeColor }}>
            <p className="glitch-text">&gt; ANALYZING SYSTEM LOAD...</p>
            <p className="glitch-text delay-1">&gt; DEFRAGMENTING EMOTIONS...</p>
            <p className="glitch-text delay-2">&gt; CONNECTING TO CORE...</p>
          </div>
        )}

        {status === 'PURGED' && response && (
          <div className="result-screen fade-in">
            <p>&gt; SYSTEM LOAD DETECTED: {response.load}</p>
            <h2 style={{ marginTop: '20px' }}>PATCH APPLIED:</h2>
            <div className="typewriter-container">
              <h1 className="typewriter">{response.patch}</h1>
            </div>
            
            <p style={{ marginTop: '40px', opacity: 0.7 }}>
              &gt; MEMORY SEGMENT CLEARED.<br/>
              &gt; RAM OPTIMIZED.
            </p>

            <button 
              onClick={() => { setStatus('IDLE'); setResponse(null); setThemeColor('#33ff00'); }}
              style={{ marginTop: '40px', color: themeColor, borderColor: themeColor }}
            >
              [ REBOOT SYSTEM ]
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;