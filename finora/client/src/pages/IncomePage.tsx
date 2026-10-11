import { ArrowDownLeft } from 'lucide-react';
import PagePlaceholder from '../components/PagePlaceholder';
import { pageRoutes } from '../types';

export default function IncomePage() {
  return <PagePlaceholder title="Income" description="Every payday, project, and little extra."
    icon={ArrowDownLeft} heading="Make room for what comes next."
    message="Your earnings will come together here, with a clear breakdown of where they come from."
    action={{ to: pageRoutes.addTransaction + '?type=income', label: 'Add income' }}
    features={[
      { title: 'Income overview', description: 'See earnings for your selected month and filters.' },
      { title: 'Your income sources', description: 'Understand the contribution of each income category.' },
      { title: 'Income history', description: 'Browse, filter, and correct entries using the shared transaction tools.' },
    ]} />;
}
