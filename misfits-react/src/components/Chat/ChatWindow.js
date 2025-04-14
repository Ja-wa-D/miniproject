import React, { useEffect, useRef } from 'react';
import { Paper, Typography } from '@mui/material';
import {
  ChatContainer,
  MessageArea,
  Message,
  TypingIndicator,
  OnlineCount
} from '../../styles/ChatStyles';
import ChatInput from './ChatInput';

const ChatWindow = ({
  messages,
  isTyping,
  onlineCount,
  onSendMessage,
  connected,
  onDisconnect
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Paper elevation={3} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ChatContainer>
        <MessageArea>
          {messages.map((msg, index) => (
            <Message key={index} isStranger={msg.isStranger}>
              <Typography variant="body1">
                {msg.text}
              </Typography>
            </Message>
          ))}
          {isTyping && (
            <TypingIndicator>
              Stranger is typing...
            </TypingIndicator>
          )}
          <div ref={messagesEndRef} />
        </MessageArea>
        
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={!connected}
        />
      </ChatContainer>
      
      <OnlineCount>
        {onlineCount} online
      </OnlineCount>
    </Paper>
  );
};

export default ChatWindow;