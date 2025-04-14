import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
`;

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  height: 100%;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

export const MessageArea = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  margin-bottom: 20px;
`;

export const InputArea = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
`;

export const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
  text-align: center;
`;

export const Message = styled.div`
  margin: 10px 0;
  padding: 10px 15px;
  border-radius: 10px;
  max-width: 70%;
  word-wrap: break-word;
  
  ${props => props.isStranger ? `
    background-color: #e9ecef;
    align-self: flex-start;
  ` : `
    background-color: #007bff;
    color: white;
    align-self: flex-end;
  `}
`;

export const TypingIndicator = styled.div`
  padding: 10px;
  color: #6c757d;
  font-style: italic;
`;

export const OnlineCount = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border-radius: 20px;
  font-size: 14px;
`;