import { createFileRoute } from '@tanstack/react-router';
import { MicrosoftCalendarIntegration } from '../../features/integrations/MicrosoftCalendarIntegration';

export const Route = createFileRoute('/settings/integrations')({
  component: MicrosoftCalendarIntegration,
});
