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
  const [isPaired, setIsPaired] = useState(false);

  useEffect(() => {
    let socket = null;
    
    if (chatStarted) {
      // Create socket connection
      const newSocket = io('http://localhost:8001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        // Automatically try to find a chat partner when connected
        newSocket.emit('new');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
        setIsPaired(false);
        setMessages(prev => [...prev, { text: 'Disconnected from server. Trying to reconnect...', isStranger: true }]);
      });

      newSocket.on('connect_error', (error) => {
        console.log('Connection error:', error);
        setMessages(prev => [...prev, { text: 'Connection error. Please try again...', isStranger: true }]);
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

      newSocket.on('conn', () => {
        setIsPaired(true);
        setMessages(prev => [...prev, { text: 'Connected to a stranger!', isStranger: true }]);
      });

      newSocket.on('disconn', (data) => {
        setIsPaired(false);
        if (data && data.who === 2) {
          setMessages(prev => [...prev, { text: 'Stranger disconnected.', isStranger: true }]);
          // Automatically try to find a new partner
          newSocket.emit('new');
          setMessages(prev => [...prev, { text: 'Looking for a new chat partner...', isStranger: true }]);
        }
      });

      socket = newSocket;
      setSocket(newSocket);
      
      // Emit new chat request after a short delay
      const timer = setTimeout(() => {
        if (socket && socket.connected) {
          socket.emit('new');
        }
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [chatStarted]);

  const handleStartChat = () => {
    setMessages([]); // Clear any previous messages
    setChatStarted(true);
  };

  const handleSendMessage = (message) => {
    if (socket && connected && isPaired) {
      socket.emit('chat', message);
      setMessages(prev => [...prev, { text: message, isStranger: false }]);
    }
  };

  const handleDisconnect = () => {
    if (socket && connected) {
      if (isPaired) {
        socket.emit('disconn');
        setIsPaired(false);
      }
      socket.emit('new');
      setMessages(prev => [...prev, { text: 'Looking for someone to chat with...', isStranger: true }]);
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
            connected={connected && isPaired}
            onDisconnect={handleDisconnect}
            disconnectButtonText={isPaired ? 'Disconnect' : 'New Chat'}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
