'use client';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <span className="loader"></span>
      <StyleSheet />
    </div>
  );
}

export function StyleSheet() {
  return (
    <style>
      {`
    .loader {
      width: 48px;
      height: 48px;
      border: 5px dotted #3b82f6;
      border-radius: 50%;
      display: inline-block;
      position: relative;
      box-sizing: border-box;
      animation: rotation 2s linear infinite;
    }

    .dark .loader {
      border-color: #60a5fa;
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `}
    </style>
  );
}
