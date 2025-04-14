import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Container } from './styles/ChatStyles';
import WelcomeScreen from './components/Welcome/WelcomeScreen';
import ChatWindow from './components/Chat/ChatWindow';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#6c757d',
    },
  },
});

function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [chatStarted, setChatStarted] = useState(false);

  useEffect(() => {
    if (chatStarted && !socket) {
      const newSocket = io('http://localhost:8001');
      
      newSocket.on('connect', () => {
        setConnected(true);
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('chat', (message) => {
        setMessages(prev => [...prev, { text: message, isStranger: true }]);
      });

      newSocket.on('typing', (isTyping) => {
        setIsTyping(isTyping);
      });

      newSocket.on('online', (count) => {
        setOnlineCount(count);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [chatStarted]);

  const handleStartChat = () => {
    setChatStarted(true);
  };

  const handleSendMessage = (message) => {
    if (socket && connected) {
      socket.emit('chat', message);
      setMessages(prev => [...prev, { text: message, isStranger: false }]);
    }
  };

  const handleDisconnect = () => {
    if (socket) {
      socket.disconnect();
      setMessages([]);
      setChatStarted(false);
      setSocket(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {!chatStarted ? (
          <WelcomeScreen onStartChat={handleStartChat} />
        ) : (
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onlineCount={onlineCount}
            onSendMessage={handleSendMessage}
            connected={connected}
            onDisconnect={handleDisconnect}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
