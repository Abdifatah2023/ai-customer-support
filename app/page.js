'use client'

import { Box, Button, Stack, TextField, Typography, Divider } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { styled } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import { TypeAnimation } from 'react-type-animation';
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the TCU IT Support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) return result;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        result += chunk;
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + chunk, temperature: 1 },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const HighlightedSpan = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    fontSize: 'inherit',
    position: 'relative',
    display: 'inline-block',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      height: '2px',
      background: theme.palette.primary.main,
      transform: 'scaleX(0)',
      transformOrigin: 'right',
      transition: 'transform 0.3s ease-out',
    },
    '&:hover::after': {
      transform: 'scaleX(1)',
      transformOrigin: 'left',
    },
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    },
    '&:hover': {
      animation: 'pulse 1s infinite',
    },
  }));

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      sx={{
        backgroundImage: "url('/tcu.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        alignItems: 'top',
      }}
      display="flex"
      flexDirection="column"
      bgcolor="white"
      position="relative"
    >
      <Box width="100%" height="200px">
        <Typography variant="h2" color="black" textAlign="center" pt={4}>
          <HighlightedSpan>TCU</HighlightedSpan> IT <HighlightedSpan>Support</HighlightedSpan>
        </Typography>
      </Box>

      <Typography
        align="center"
        justifyContent="center"
        marginTop="1%"
        marginRight="30%"
        marginLeft="20%"
      >
        <TypeAnimation
          sequence={[
            "Assisting TCU's Growing Community with Top-Tier Technology Services",
            1000, // Wait for 1 second
            "", // Clear the text
            1000, // Wait for 1 second before repeating
          ]}
          speed={50} // Typing speed
          style={{ fontSize: '5em', textAlign: 'center', backgroundColor: 'rgba(204, 153, 255, 1)', boxShadow: '0 0 20px rgba(255, 255, 0, 0.8)' }} // Increased font size, centered, and highlighted
          repeat={Infinity} // Repeat indefinitely
          fontWeight='bold'
        />
        </Typography>
  
        <Stack
          direction={'column'}
          width="500px"
          height="700px"
          border="2px solid black"
          borderRadius={2}
          p={2}
          spacing={3}
          position="absolute"
          bottom={16}
          right={16}
          bgcolor="white"
        >
          <Box bgcolor="white" color="white" borderRadius="16px 16px 0 0">
            <Typography variant="h6" color="black" align="left" fontWeight="bold">
              <SmartToyIcon
                sx={{
                  fontSize: '24px',
                  marginRight: '8px',
                }}
              />
              FrogBot
            </Typography>
          </Box>
          <Divider />
  
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="calc(100% - 120px)"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? '#37474f'
                      : '#7e57c2'
                  }
                  color="white"
                  borderRadius={12}
                  p={3}
                  sx={{
                    fontFamily: 'Helvetica Neue',
                    fontSize: 14
                  }}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={'row'} spacing={0}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <Button
                    startIcon={<SendIcon />}
                    onClick={sendMessage}
                    sx={{ marginLeft: 0, color: 'purple' }}
                  >
                    <Typography fontWeight="bold">Send</Typography>
                  </Button>
                ),
              }}
            />
          </Stack>
        </Stack>
      </Box>
    );
}