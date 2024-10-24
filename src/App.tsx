import React from 'react';
import TimeDisplay from './components/BrowserWindow';
import MessagingWindow from './components/MessagingWindow';
import { Wallpaper } from 'react-windows-xp';

const App: React.FC = () => {
  return (
    <Wallpaper fullScreen>
      <div style={{ 
        display: 'flex', 
        padding: '20px', 
        height: 'calc(100vh - 40px)', 
        gap: '20px' 
      }}>
        <div style={{ flex: '0 0 33%' }}>
          <MessagingWindow />
        </div>
        <div style={{ flex: '0 0 67%' }}>
          <TimeDisplay />
        </div>
      </div>
    </Wallpaper>
  );
};

export default App;