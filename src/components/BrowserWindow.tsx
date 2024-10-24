import React from 'react';
import useTime from '../hooks/useTime';
import { Window, TextBox, Button } from 'react-windows-xp';

const BrowserWindow: React.FC = () => {
  const { time, error } = useTime();

  return (
    <Window
      title="Internet Explorer"
      showClose
      showMaximize
      showMinimize
      showHelp
      style={{ height: '100%', width: '100%' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Menu Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          borderBottom: '1px solid #a0a0a0',
          background: '#ECE9D8'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Favorites</span>
            <span>Tools</span>
            <span>Help</span>
          </div>
          <img 
            src="https://seeklogo.com/images/W/windows-xp-icon-logo-E8F84DD6F3-seeklogo.com.png" 
            alt="Windows"
            style={{ width: '16px', height: '16px' }}
          />
        </div>

        {/* Address Bar */}
        <div style={{
          display: 'flex',
          padding: '4px 8px',
          gap: '8px',
          borderBottom: '1px solid #a0a0a0',
          alignItems: 'center'
        }}>
          <span>Address</span>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center',
            background: 'white',
            border: '1px solid #7F9DB9'
          }}>
            <img 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA8UlEQVR42pWSsQ2DMBBFrYiNbhZqqngFWlfs4G0YwHVWQKIKZZTC8b/kHHMYSCx9YYHf88dgTDH6vo/DMJzG7A0Izob3PrZtG48Fz/tuIMC1KtECYwOnFAAkohylcBkqYbIxLsvC8xACt8BmqoWLNj3waQHRO4ljicC4zvOcJYXApRtY7leVITHhKwGMTNONJVnA7x48V9WvICnhlQBwSLtTWiQCaSDVAWIOcNOg6zqub+jdABnHkcNnwVK/38A58zk0m4EyGq6eAcDL9RGbpuEAktTgjUAk8iPpz6bhqkC+huxYAho+FODBr6kKcPOfvACzZogqWb89XgAAAABJRU5ErkJggg==" 
              alt=""
              style={{ width: '16px', height: '16px', margin: '0 4px' }}
            />
            <TextBox 
              id="address"
              style={{ 
                flex: 1,
                border: 'none',
                outline: 'none'
              }}
              value="https://www.google.com.tw"
            />
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <img 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAJPSURBVDhPjZHbS9phHMZ/RVIUJZ1VLDErsJNGVHbCMpQOYlQSVBQdCIsCuxg127K20U3URazWgcpSy85mx0Eb7Krb3Y3tr/ksf7qLXW0feK/e7/M83/d5hdDPEDNPMzhuHfRf9mM/tdMR6KDN30b7UTsWnwXjgZG6/TrKt8rRrGhYflpGmH2aZe/7HivPK7i+uJj+PM3E3QRjN2OMXI8wcDVAz3kPtoCNpsMmdOs65LNyhMn7SVafV1n8tojz0YnjxsHQ1RB3v+4IYz2y0upvFUW1e7XoN/TkzuUiDAYHmfs6JyaNXo/Sd95H13GXKPpDxXYF+m09+i29mKiZ1yB0n3Yz9TDF+N04g5eD2E/sWH1WTB5TVBZBu6mleKuY0o1SNO4XYbiI0dAow8Fhes976TzupMXbgtFjpGq3KiqLULhdSNFmEWq3GsHsNdN30Re9+jcFOwXkLOQghJ3D6/4vqn0VsncyhMqdSvG/uk66RAPbiY3WwEuLJ00YzgzR8QjyCzkyr4y092kIJZ9KMB2YxNrD77UGrFgCFhrPGqPjERS3CjKCGUh9UpIWkxDy1vIw7Bpo9jbT4m/BfGTGdPx3o+p7NbIHGSmhFBJ8CUjcEgT5qpxwavVuNQ2eBuo99dQc1uD74RNF+cF8lCEl6TfpJF4mEueJI9YVi5D6IRXVioqitSJ0H3WUrZeJRtodLZp9DUqfkkx/Jsn+ZCQeCTFrMQhOAWHpcQmpU0rWqywUMwrxyF7LyHZlkz6fTvJCMonuROLfxhP75iVpWmDheoHfNvbnLyE6SFEAAAAASUVORK5CYII=" 
              alt="Go"
              style={{ width: '16px', height: '16px' }}
            />
            Go
          </button>
          <span>Links</span>
        </div>

        {/* Content Area */}
        <div style={{ 
          flex: 1,
          padding: '8px',
          backgroundColor: '#fff',
          overflow: 'auto'
        }}>
          {error ? (
            <div>Error: {error}</div>
          ) : !time ? (
            <div>Loading...</div>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '100px' }}>
              <img 
                src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" 
                alt="Google"
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div style={{
          padding: '2px 8px',
          borderTop: '1px solid #a0a0a0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA8UlEQVR42pWSsQ2DMBBFrYiNbhZqqngFWlfs4G0YwHVWQKIKZZTC8b/kHHMYSCx9YYHf88dgTDH6vo/DMJzG7A0Izob3PrZtG48Fz/tuIMC1KtECYwOnFAAkohylcBkqYbIxLsvC8xACt8BmqoWLNj3waQHRO4ljicC4zvOcJYXApRtY7leVITHhKwGMTNONJVnA7x48V9WvICnhlQBwSLtTWiQCaSDVAWIOcNOg6zqub+jdABnHkcNnwVK/38A58zk0m4EyGq6eAcDL9RGbpuEAktTgjUAk8iPpz6bhqkC+huxYAho+FODBr6kKcPOfvACzZogqWb89XgAAAABJRU5ErkJggg==" 
              alt=""
              style={{ width: '16px', height: '16px' }}
            />
            <span>Done</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgklEQVR42s2TQQ6AIAwE+/R9Gj9bLQLaUqskHixpSKwzmA2K/LYA0PcSqFVKoejCpSURKTigvgzMJriR1M/sL/MCGVh3YQzXId2JtPCYOYkRTH3MTCZrgiDQUDACczJEgfoc9ofzKS6TVNAkVgDbKdwFSATnHchuJZ5Avv0dGPT3tQGt6vGOoDIgSwAAAABJRU5ErkJggg==" 
              alt=""
              style={{ width: '16px', height: '16px' }}
            />
            <span>Internet</span>
          </div>
        </div>
      </div>
    </Window>
  );
};

export default BrowserWindow;
