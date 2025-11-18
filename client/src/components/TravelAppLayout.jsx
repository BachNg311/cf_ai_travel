import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Container,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import ProfileForm from './ProfileForm';
import ChatPanel from './ChatPanel';
import PlanTimeline from './PlanTimeline';
import ActionChips from './ActionChips';
import { useTravelAgent } from '../hooks/useTravelAgent';

const generateUserId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `traveler-${Date.now()}`;
};

const TravelAppLayout = () => {
  const userId = useMemo(generateUserId, []);
  const { profile, isProfileLoading, updateProfile, sendMessage } =
    useTravelAgent(userId);
  const [messages, setMessages] = useState([]);
  const [plan, setPlan] = useState(null);
  const [actions, setActions] = useState([]);
  const [error, setError] = useState('');

  const handleSend = async ({ text, metadata }) => {
    if (!text?.trim()) return;
    setError('');
    const userMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const response = await sendMessage.mutateAsync({
        message: text,
        metadata
      });
      setPlan(response.plan);
      setActions(response.workflow?.actions || []);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.plan?.summary || 'Plan generated.',
          plan: response.plan,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to reach the agent.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Workers AI is unavailable right now. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleProfileSave = async (profileInput) => {
    setError('');
    try {
      await updateProfile.mutateAsync(profileInput);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save profile.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(0,212,255,0.25), transparent 55%), #050816',
        py: 6
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="secondary.light">
              Cloudflare Travel Agent
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              Plan journeys with Workers AI + Durable state
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, maxWidth: 720 }}>
              Capture traveler preferences, coordinate a travel workflow, and
              co-create itineraries backed by Workers AI (Llama 3.3) and Durable
              Objects-style memory.
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <ProfileForm
                  loading={isProfileLoading || updateProfile.isPending}
                  profile={profile}
                  onSave={handleProfileSave}
                />
                <ActionChips plan={plan} actions={actions} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <ChatPanel
                  messages={messages}
                  onSend={handleSend}
                  isSending={sendMessage.isPending}
                />
                <PlanTimeline plan={plan} />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default TravelAppLayout;

