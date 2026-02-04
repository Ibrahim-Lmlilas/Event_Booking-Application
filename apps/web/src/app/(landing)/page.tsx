import Hero from '@/components/home/Hero';
import Events from '@/components/home/Events';
import About from '@/components/home/About';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Booking - Discover & Book Amazing Events',
  description: 'Find and book the best events, workshops, and conferences near you.',
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Events />
      <About />
    </main>
  );
}
