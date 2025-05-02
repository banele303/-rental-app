import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/landing/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 m-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">Test Tailwind</h1>
        <p className="mt-2 text-gray-600">If you can see this styled text, Tailwind is working!</p>
      </div>
      <Navbar />
      <main className="h-full flex w-full flex-col">
        <Landing />
      </main>
    </div>
  );
}
