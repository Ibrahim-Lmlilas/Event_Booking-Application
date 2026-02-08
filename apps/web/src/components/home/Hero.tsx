import ClickSpark from '@/components/ClickSpark';
import CurvedLoop from '@/components/CurvedLoop';

export default function Hero() {
  return (
    <section className="relative flex flex-col h-screen overflow-hidden bg-gray-300 bg-[url('/Hero.png')] bg-cover bg-no-repeat bg-center sm:bg-center md:bg-center min-h-[100dvh]">
      <div
        className="absolute inset-0 bg-gray-900/80 sm:bg-gray-900/45 md:bg-gray-900/70 z-[0]"
        aria-hidden
      />
      <div className="relative flex-1 min-h-0 flex flex-col z-10 items-center justify-center px-4">
        <div className="absolute inset-0">
          <ClickSpark
            sparkColor="#ec4899"
            sparkSize={33}
            sparkRadius={66}
            sparkCount={14}
            duration={400}
            easing="ease-out"
            extraScale={1}
          >
            <div className="relative w-full h-full" />
          </ClickSpark>
        </div>
        {/* Screen-style text overlay - each line stays on one row */}
        <div className="relative z-20 text-center w-full px-4 overflow-x-hidden min-w-0">
          <p className="text-white/90 italic text-base sm:text-lg md:text-xl mb-3 whitespace-nowrap">
            &ldquo;World&apos;s fastest-growing event platform&rdquo; — Eventzi
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight mb-2 whitespace-nowrap">
            BOOK YOUR EVENT
          </h1>
          <p className="text-white/80 text-base sm:text-lg md:text-xl mb-2 whitespace-nowrap">
            Discover and reserve tickets for the best events
          </p>
          <p className="text-white/70 text-sm sm:text-base md:text-lg mb-8 whitespace-nowrap">
            Available now — Anywhere, anytime
          </p>
        </div>
      </div>
      <div className="relative z-10">
        <CurvedLoop
          marqueeText="EVENT BOOKING ✦ BOOK YOUR TICKETS ✦ AVAILABLE NOW ✦"
          speed={2}
          curveAmount={-400}
          direction="right"
          interactive={true}
          compact
          compactTextColor="rgb(255 255 255)"
        />
      </div>
    </section>
  );
}
