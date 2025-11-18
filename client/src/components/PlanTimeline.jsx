import {
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography
} from '@mui/material';

const PlanTimeline = ({ plan }) => {
  if (!plan) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Itinerary preview</Typography>
          <Typography color="text.secondary">
            Your AI itinerary will appear here after you send the first request.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              {plan.travelerPersona}
            </Typography>
            <Typography variant="h5">{plan.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {plan.summary}
            </Typography>
          </div>
          <Divider light />
          <Stack spacing={2}>
            {(plan.dayPlans || []).map((day) => (
              <Stack
                key={`${day.day}-${day.city}`}
                sx={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  p: 2
                }}
                spacing={1}
              >
                <Typography variant="subtitle2" color="primary.light">
                  {day.day} · {day.city}
                </Typography>
                <Typography variant="body2">
                  <strong>Morning:</strong> {day.morning}
                </Typography>
                <Typography variant="body2">
                  <strong>Afternoon:</strong> {day.afternoon}
                </Typography>
                <Typography variant="body2">
                  <strong>Evening:</strong> {day.evening}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {day.notes}
                </Typography>
              </Stack>
            ))}
          </Stack>
          {plan.travelTips?.length ? (
            <>
              <Divider light />
              <Typography variant="subtitle2">Travel tips</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {plan.travelTips.map((tip) => (
                  <Chip key={tip} label={tip} color="secondary" variant="outlined" />
                ))}
              </Stack>
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PlanTimeline;

