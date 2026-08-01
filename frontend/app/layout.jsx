import { ThemeProvider } from "next-themes";
import "./global.css"

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    // className}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"       
          defaultTheme="system"    
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
