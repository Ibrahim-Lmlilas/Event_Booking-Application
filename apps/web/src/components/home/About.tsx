import { Target, Zap, Lock, Globe, Smartphone, MessageCircle } from 'lucide-react';

function CardTitle({ children }: { children: string }) {
  const first = children.slice(0, 1);
  const rest = children.slice(1);
  return (
    <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-900 dark:text-white">
      {first}
      {rest}
    </h3>
  );
}

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          ABOUT EVENT BOOKING
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-center mb-4">
              <Target className="w-12 h-12 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
            </div>
            <CardTitle>Easy to Use</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Simple and intuitive booking process in just a few clicks
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-center mb-4">
              <Zap className="w-12 h-12 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />
            </div>
            <CardTitle>Instant Confirmation</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Get your booking confirmation and PDF ticket immediately
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-center mb-4">
              <Lock
                className="w-12 h-12 text-emerald-600 dark:text-emerald-400"
                strokeWidth={1.5}
              />
            </div>
            <CardTitle>Secure & Reliable</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Your data is protected with enterprise-grade security
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-center mb-4">
              <Globe className="w-12 h-12 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
            </div>
            <CardTitle>Wide Variety</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Discover conferences, workshops, concerts and more in one place
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-center mb-4">
              <Smartphone
                className="w-12 h-12 text-violet-600 dark:text-violet-400"
                strokeWidth={1.5}
              />
            </div>
            <CardTitle>Any Device</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Book from your phone, tablet or computer anytime
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-center mb-4">
              <MessageCircle
                className="w-12 h-12 text-pink-600 dark:text-pink-400"
                strokeWidth={1.5}
              />
            </div>
            <CardTitle>Support 24/7</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Our team is here to help you with any question
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We are your trusted platform for discovering and booking the best events. Whether
            you&apos;re looking for professional workshops, exciting conferences, or community
            gatherings, we make it easy to find and reserve your spot.
          </p>
        </div>
      </div>
    </section>
  );
}
