import { ThemeProvider } from "next-themes";
import { ToastProvider } from "../providers/toastProvider";
import "@/global.css"
import DisableAutoRestoreScrollComponent from "@/shared/DisableAutoRestoreScrollComponent";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    // className}
    >
      <body className="min-h-full flex flex-col">
        <DisableAutoRestoreScrollComponent />
        <ThemeProvider

          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html >
  );
}
