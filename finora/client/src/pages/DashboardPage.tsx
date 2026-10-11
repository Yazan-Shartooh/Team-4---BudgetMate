import { Wallet } from 'lucide-react';
import PagePlaceholder from '../components/PagePlaceholder';
import { pageRoutes } from '../types';

export default function DashboardPage() {
  return <PagePlaceholder title="A little more in control."
    description="Welcome back, Omar. A clearer view of your money starts here."
    icon={Wallet} heading="Every income. Every expense. One clear picture."
    message="Your monthly overview will bring your balance, spending, and budget check-in together in one place."
    action={{ to: pageRoutes.transactions, label: 'Explore transactions' }}
    features={[
      { title: 'Your monthly picture', description: 'Income, expenses, savings, and your savings rate, calculated together.' },
      { title: 'Room in your budget', description: 'A clear view of categories approaching their limit or going over.' },
      { title: 'The latest activity', description: 'Recent transactions and your overall available balance at a glance.' },
    ]} />;
}
