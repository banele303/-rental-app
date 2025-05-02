import { Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md z-50">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>
      
      {/* Grid pattern for texture */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      
      {/* Animated glow effect */}
      <div className="absolute w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute w-48 h-48 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      {/* Sliced elements in background */}
      <div className="absolute top-1/4 -left-20 w-80 h-40 bg-gradient-to-r from-blue-500/10 to-transparent rotate-12 rounded-full blur-xl"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-40 bg-gradient-to-l from-purple-500/10 to-transparent -rotate-12 rounded-full blur-xl"></div>
      
      {/* Geometric shapes */}
      <div className="absolute top-1/3 right-1/4 w-20 h-20 border border-gray-700/40 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-gray-700/40 rounded-full animate-ping-slow"></div>
      
      {/* Loading indicator with pulse glow */}
      <div className="relative flex flex-col items-center justify-center z-10">
        <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        
        <div className="mt-6 relative">
          <span className="text-sm font-medium text-white tracking-wider">
            LOADING<span className="animate-blink">...</span>
          </span>
          
          {/* Progress line */}
          <div className="mt-2 relative h-0.5 w-40 bg-gray-800 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 w-full animate-progress rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this to your tailwind.config.js:
// extend: {
//   animation: {
//     'spin-slow': 'spin 8s linear infinite',
//     'ping-slow': 'ping 5s cubic-bezier(0, 0, 0.2, 1) infinite',
//     'progress': 'progress 2s ease-in-out infinite',
//     'blink': 'blink 1.4s infinite'
//   },
//   keyframes: {
//     progress: {
//       '0%': { transform: 'translateX(-100%)' },
//       '50%': { transform: 'translateX(0)' },
//       '100%': { transform: 'translateX(100%)' }
//     },
//     blink: {
//       '0%': { opacity: '0' },
//       '50%': { opacity: '1' },
//       '100%': { opacity: '0' }
//     }
//   }
// }

export default Loading;