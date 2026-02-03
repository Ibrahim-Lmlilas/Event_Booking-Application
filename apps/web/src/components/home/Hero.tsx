import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ClickSpark from '@/components/ClickSpark';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full">
        <ClickSpark
          sparkColor="#ff00ff"
          sparkSize={32}
          sparkRadius={65}
          sparkCount={11}
          duration={400}
          easing="ease-out"
          extraScale={1}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover & Book Amazing Events
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of people attending incredible events. From workshops to conferences,
            find and book your next experience in just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}