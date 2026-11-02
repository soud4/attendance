interface BaseHeadProps {
  title: string;
  children?: any;
}

export function BaseHead({ title, children }: BaseHeadProps) {
  return (
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="view-transition" content="same-origin" />
      <title>{title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/css/tailwind.css" />
      <script src="/js/vendor/alpine.min.js" defer></script>
      <style>{`
        @view-transition {
          navigation: auto;
        }
        ::view-transition-old(root) {
          animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out;
        }
        ::view-transition-new(root) {
          animation: 180ms cubic-bezier(0, 0, 0.2, 1) 40ms both fade-in;
        }
        @keyframes fade-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        [x-cloak] {
          display: none !important;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
      {children}
    </head>
  );
}
