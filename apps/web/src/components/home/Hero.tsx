import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ClickSpark from '@/components/ClickSpark';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-orange-50 to-amber-50">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full">
        <ClickSpark
          sparkColor="#ff6b6b"
          sparkSize={28}
          sparkRadius={60}
          sparkCount={8}
          duration={350}
          easing="ease-out"
          extraScale={1.2}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
              <span className="block text-gray-900">CONNECT.</span>
              <span className="block text-gray-900">INSPIRE.</span>
              <span className="block text-gray-900">TRANSFORM.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
              Join visionaries, creators, and innovators for an unforgettable day of inspiration, insight, and real connections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-6 text-lg font-semibold"
              >
                <Link href="/events">Browse Events</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full px-8 py-6 text-lg font-semibold"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Right Side - Image with Badge */}
          <div className="relative">
            {/* Main Image Container with Tilted Frame */}
            <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="relative overflow-hidden rounded-3xl border-8 border-purple-600 shadow-2xl">
                {/* Placeholder for event image - replace with actual image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-xl font-bold">Event Workshop</p>
                    <p className="text-sm opacity-90 mt-2">Real connections, Real impact</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 lg:-right-12 z-20 animate-bounce">
              <div className="relative">
                {/* Star/Badge Shape */}
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                  <div className="text-center text-white">
                    <p className="text-lg lg:text-xl font-bold leading-tight">Grab<br/>Your<br/>Ticket</p>
                  </div>
                </div>
                {/* Pulse effect */}
                <div className="absolute inset-0 w-32 h-32 lg:w-40 lg:h-40 bg-pink-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}