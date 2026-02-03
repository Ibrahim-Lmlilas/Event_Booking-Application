export default function About() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          About Event Booking
        </h2>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          We are your trusted platform for discovering and booking the best events. 
          Whether you're looking for professional workshops, exciting conferences, 
          or community gatherings, we make it easy to find and reserve your spot.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Easy to Use</h3>
            <p className="text-gray-600 dark:text-gray-300">Simple and intuitive booking process in just a few clicks</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Instant Confirmation</h3>
            <p className="text-gray-600 dark:text-gray-300">Get your booking confirmation and PDF ticket immediately</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Secure & Reliable</h3>
            <p className="text-gray-600 dark:text-gray-300">Your data is protected with enterprise-grade security</p>
          </div>
        </div>
      </div>
    </section>
  );
}
