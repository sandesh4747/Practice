const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative w-24 h-24">
        {/* Outer faint ring */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-200 opacity-20" />

        {/* Animated spinner ring */}
        <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 border-solid animate-spin shadow-lg" />

        {/* Screen reader text */}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
