import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography
} from '@mui/material';

const months = [
  'Flexible',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const ChatPanel = ({ messages = [], onSend, isSending }) => {
  const [input, setInput] = useState('');
  const [travelMonth, setTravelMonth] = useState('Flexible');
  const [durationDays, setDurationDays] = useState(4);

  const handleSend = () => {
    onSend?.({
      text: input,
      metadata: {
        travelMonth,
        durationDays
      }
    });
    setInput('');
  };

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Conversation
            </Typography>
            <Typography variant="h5">Chat with Terra</Typography>
          </div>
          <Stack
            spacing={1.5}
            sx={{
              minHeight: 220,
              maxHeight: 320,
              overflowY: 'auto',
              pr: 1
            }}
          >
            {messages.length === 0 && (
              <Typography color="text.secondary">
                Describe the kind of trip you need and Terra will stitch together
                a workflow with Workers AI.
              </Typography>
            )}
            {messages.map((message, index) => (
              <Box
                key={`${message.timestamp}-${index}`}
                sx={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor:
                    message.role === 'user'
                      ? 'rgba(0,212,255,0.15)'
                      : 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  maxWidth: '85%'
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {message.role === 'user' ? 'You' : 'Terra'}
                </Typography>
                <Typography variant="body2">{message.content}</Typography>
              </Box>
            ))}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              select
              SelectProps={{ native: true }}
              label="Travel month"
              value={travelMonth}
              onChange={(event) => setTravelMonth(event.target.value)}
              size="small"
              fullWidth
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </TextField>
            <TextField
              label="Days"
              type="number"
              value={durationDays}
              onChange={(event) => setDurationDays(Number(event.target.value))}
              size="small"
              inputProps={{ min: 2, max: 21 }}
            />
          </Stack>
          <TextField
            multiline
            minRows={3}
            label="What should we plan?"
            placeholder="e.g. Work-friendly Lisbon week with surf escapes"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={isSending || !input.trim()}
          >
            {isSending ? 'Coordinating...' : 'Generate plan'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;

