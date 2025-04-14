import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { InputArea } from '../../styles/ChatStyles';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <InputArea>
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '10px' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={disabled || !message.trim()}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </form>
    </InputArea>
  );
};

export default ChatInput;