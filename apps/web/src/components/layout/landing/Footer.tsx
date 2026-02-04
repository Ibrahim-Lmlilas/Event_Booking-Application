export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t-2 border-white py-6">
      <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Eventzi. All rights reserved.
      </div>
    </footer>
  );
}
