import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RoamingCEO - Where You Do Business',
  description: 'The professional networking and business super-platform. From graduates to CEOs, from freelancers to investors. LinkedIn is where you exist. RoamingCEO is where you do business.',
  icons: {
    icon: 'https://customer-assets.emergentagent.com/job_next-portal-hub/artifacts/5al7e509_logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
