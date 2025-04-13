// app/error.tsx

'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[400px] flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-pink-400 mb-4">Something went wrong!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{error.message}</p>

      <button
        onClick={() => reset()}
        className="text-white bg-blue-600 cursor-pointer hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Try Again
      </button>
    </div>
  );
}
