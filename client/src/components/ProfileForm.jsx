import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography
} from '@mui/material';

const defaultProfile = {
  homeAirport: '',
  travelers: 'Solo adventurer',
  travelStyle: 'balanced',
  budget: 'mid-range',
  interests: ['culture', 'food']
};

const travelStyles = ['balanced', 'luxury', 'budget', 'outdoors', 'remote-work'];

const ProfileForm = ({ profile, loading, onSave }) => {
  const [formState, setFormState] = useState(defaultProfile);
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    if (profile) {
      setFormState((prev) => ({ ...prev, ...profile }));
    }
  }, [profile]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddInterest = () => {
    const value = interestInput.trim();
    if (!value) return;
    setFormState((prev) => ({
      ...prev,
      interests: Array.from(new Set([...(prev.interests || []), value]))
    }));
    setInterestInput('');
  };

  const handleDeleteInterest = (tag) => () => {
    setFormState((prev) => ({
      ...prev,
      interests: (prev.interests || []).filter((item) => item !== tag)
    }));
  };

  const handleSubmit = () => {
    onSave?.(formState);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Traveler profile
            </Typography>
            <Typography variant="h6">Preferences</Typography>
          </div>
          <TextField
            label="Home airport"
            placeholder="e.g. SFO"
            value={formState.homeAirport}
            onChange={handleChange('homeAirport')}
            size="small"
          />
          <TextField
            label="Travelers"
            placeholder="e.g. Couple, family"
            value={formState.travelers}
            onChange={handleChange('travelers')}
            size="small"
          />
          <TextField
            select
            SelectProps={{ native: true }}
            label="Travel style"
            value={formState.travelStyle}
            onChange={handleChange('travelStyle')}
            size="small"
          >
            {travelStyles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </TextField>
          <TextField
            label="Budget"
            placeholder="mid-range, splurge..."
            value={formState.budget}
            onChange={handleChange('budget')}
            size="small"
          />
          <Divider light />
          <Typography variant="subtitle2" color="text.secondary">
            Interests
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(formState.interests || []).map((interest) => (
              <Chip
                key={interest}
                label={interest}
                onDelete={handleDeleteInterest(interest)}
                color="primary"
                size="small"
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Add interest"
              value={interestInput}
              onChange={(event) => setInterestInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddInterest();
                }
              }}
              size="small"
              fullWidth
            />
            <Button variant="outlined" onClick={handleAddInterest}>
              Add
            </Button>
          </Stack>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Saving...' : 'Save profile'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;

