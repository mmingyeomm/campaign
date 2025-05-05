import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulse Round 3 | Orca Community Campaign',
  description: 'Join the Pulse Round 3 Orca community campaign. Post content, reset the timer, and win rewards!',
  keywords: 'Pulse, Orca, community, crypto, rewards, campaign, round 3',
  openGraph: {
    title: 'Pulse Round 3 | Orca Community Campaign',
    description: 'Join the Pulse Round 3 Orca community campaign. Post content about Orca, reset the 24-hour timer, and win rewards as the last poster when time expires!',
    images: ['/images/orca.png'],
  },
};

export default function RoundThreeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
} 