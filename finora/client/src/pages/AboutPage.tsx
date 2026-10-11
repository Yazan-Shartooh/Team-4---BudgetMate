import { PiggyBank } from 'lucide-react';
import PagePlaceholder from '../components/PagePlaceholder';

export default function AboutPage() {
  return <PagePlaceholder title="About us" description="A clearer picture. A more confident you."
    icon={PiggyBank} heading="Less guessing. More understanding."
    message="Finora is a personal finance project that brings everyday income, spending, and monthly planning into one clear view."
    features={[
      { title: 'Track simply', description: 'Bring income and everyday spending into one place.' },
      { title: 'Plan deliberately', description: 'Set monthly limits that reflect your priorities.' },
      { title: 'See your progress', description: 'Turn daily entries into a meaningful monthly picture.' },
    ]} />;
}
