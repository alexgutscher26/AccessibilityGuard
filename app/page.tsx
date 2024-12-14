'use client';

import { Features } from '@/components/features';
import UrlAnalyzer from '@/components/url-analyzer';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="flex w-full items-center justify-center bg-gradient-to-b from-background via-background to-background/95 py-20 md:py-32">
        <div className="container flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl mb-6">
              Web Accessibility Testing
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
              Test your website for accessibility issues and get detailed reports powered by AI
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <UrlAnalyzer />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="flex w-full items-center justify-center py-20 bg-gradient-to-b from-background/95 via-background/98 to-background">
        <div className="container flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full"
          >
            <Features />
          </motion.div>
        </div>
      </section>
    </main>
  );
}