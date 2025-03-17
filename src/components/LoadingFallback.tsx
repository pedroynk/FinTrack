export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex space-x-2">
        <span className="h-5 w-5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
        <span className="h-5 w-5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
        <span className="h-5 w-5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
      </div>
    </div>
  );
}
