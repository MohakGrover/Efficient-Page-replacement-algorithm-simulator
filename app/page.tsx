import PageReplacementSimulator from "@/components/page-replacement-simulator"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Page Replacement Algorithm Simulator
            </h1>
            <p className="text-center mb-4 max-w-2xl mx-auto text-muted-foreground">
              Visualize how different page replacement algorithms work in operating systems memory management. Compare
              FIFO, LRU, Optimal, and Clock algorithms with custom reference strings and frame counts.
            </p>
            <div className="flex justify-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-primary/10 rounded-full">Educational Tool</span>
              <span className="px-2 py-1 bg-primary/10 rounded-full">Operating Systems</span>
              <span className="px-2 py-1 bg-primary/10 rounded-full">Memory Management</span>
            </div>
          </header>
          <PageReplacementSimulator />
          <footer className="mt-16 text-center text-sm text-muted-foreground">
            <p>This simulator is designed for educational purposes to help understand page replacement algorithms.</p>
          </footer>
        </div>
      </main>
    </ThemeProvider>
  )
}

