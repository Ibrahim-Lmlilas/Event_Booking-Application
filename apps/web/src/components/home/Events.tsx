import Image from 'next/image';

export default function Events() {
  return (
    <section id="events" className="min-h-screen py-20 flex items-center bg-[#f9fafb]">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: title + text - bigger typography */}
          <div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-gray-900 dark:text-white leading-tight">
              Unforgettable Events, One Click Away
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              From live concerts and conferences to workshops and private celebrations — find and
              book the best events in one place. Secure your spot, get instant confirmation, and get
              ready for experiences that matter.
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Browse by date, category, or location. Filter by price and availability. Your next
              great moment is just a few clicks away.
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Whether you&apos;re planning a night out with friends, a professional conference, or a
              special celebration, Eventzi brings you the best venues and experiences. Check
              upcoming events, compare options, and book in seconds.
            </p>
          </div>
          {/* Right: image - taller to fill viewport */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px] rounded-xl overflow-hidden">
            <Image
              src="/Events.png"
              alt="Live event with stage, crowd and dining"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
