import React from 'react';
import { Button, Typography, Paper } from '@mui/material';
import { WelcomeContainer } from '../../styles/ChatStyles';

const WelcomeScreen = ({ onStartChat }) => {
  return (
    <WelcomeContainer>
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, 
          maxWidth: 600, 
          width: '90%',
          textAlign: 'center'
        }}
      >
        <img 
          src="/misfits_logo.png" 
          alt="Misfits Logo" 
          style={{ 
            width: '150px', 
            marginBottom: '20px' 
          }} 
        />
        
        <Typography variant="h4" gutterBottom>
          Welcome to Misfits Chat
        </Typography>
        
        <Typography variant="body1" paragraph>
          This is a simple chat website where people get connected to other people in a one-to-one chat.
          If everyone is paired up, you must wait until someone finishes a conversation. 
          Chats are anonymous, meaning that the strangers you chat with don't know anything about you 
          (unless you describe yourself).
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={onStartChat}
        >
          Start Chatting!
        </Button>
      </Paper>
    </WelcomeContainer>
  );
};

export default WelcomeScreen;
