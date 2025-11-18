import {
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';

const ActionChips = ({ plan, actions = [] }) => {
  if (!plan) {
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Workflow actions
          </Typography>
          <Typography variant="body2">
            Once Terra proposes a plan, you will see suggested follow-up actions
            here.
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
              Workflow actions
            </Typography>
            <Typography variant="h6">Next steps</Typography>
          </div>
          <Stack spacing={1}>
            {actions.map((action) => (
              <Chip
                key={action.label}
                label={`${action.label}: ${action.recommendation}`}
                variant="outlined"
              />
            ))}
          </Stack>
          {plan.memoryHints?.length ? (
            <div>
              <Typography variant="subtitle2" color="text.secondary">
                Saved memories
              </Typography>
              <Stack spacing={1}>
                {plan.memoryHints.map((hint) => (
                  <Typography key={hint} variant="body2">
                    • {hint}
                  </Typography>
                ))}
              </Stack>
            </div>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActionChips;

