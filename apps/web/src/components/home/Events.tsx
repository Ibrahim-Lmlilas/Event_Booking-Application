import BounceCards from '../ui/BounceCards';

const eventImages = [
  '/about2.png',
  '/about3.png',
  '/event1.jpg',
  '/event2.jpg',
  '/event3.jpg',
  '/event4.jpg',
  '/about4.png',
  '/about5.png',
  '/about1.png',
];

const transformStyles = [
  'rotate(8deg) translate(-280px)',
  'rotate(-3deg) translate(-210px)',
  'rotate(5deg) translate(-140px)',
  'rotate(-6deg) translate(-70px)',
  'rotate(2deg) translate(-20px)',
  'rotate(-4deg) translate(20px)',
  'rotate(7deg) translate(70px)',
  'rotate(-2deg) translate(140px)',
  'rotate(4deg) translate(210px)',
  'rotate(-7deg) translate(280px)'
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 w-full">

        {/* BounceCards Animation */}
        <div className="flex justify-center w-full overflow-hidden mt-20">
          <BounceCards
            className="custom-bounceCards"
            images={eventImages}
            containerWidth={1300}
            containerHeight={300}
            animationDelay={0.6}
            animationStagger={0.08}
            easeType="elastic.out(1, 0.5)"
            transformStyles={transformStyles}
            enableHover
          />
        </div>
      </div>
    </section>
  );
}
