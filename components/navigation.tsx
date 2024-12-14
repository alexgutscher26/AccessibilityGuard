"use client";

import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { ModeToggle } from './mode-toggle';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/reports', label: 'Reports' },
  { href: '/settings', label: 'Settings' },
] as const;

export function Navigation() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveLink = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full py-4 px-4">
      <div className="max-w-[750px] mx-auto">
        <nav>
          <div className="flex h-12 items-center justify-between bg-muted rounded-full px-4">
            {/* Logo */}
            <Link 
              className="flex items-center" 
              href="/"
              aria-label="Home"
            >
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 items-center justify-center px-4">
              {isSignedIn && (
                <div className="flex items-center space-x-1">
                  {navItems.map((item) => {
                    const isActive = isActiveLink(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-full hover:text-primary flex items-center justify-center ${
                          isActive
                            ? 'text-primary-foreground bg-primary shadow-md'
                            : 'text-muted-foreground hover:bg-muted-foreground/10'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
              
            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full",
                    userButtonPopoverCard: "rounded-3xl",
                    userButtonPopoverActions: "rounded-3xl",
                    userButtonPopoverActionButton: "rounded-full",
                    userButtonPopoverFooter: "rounded-b-3xl"
                  }
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-primary rounded-full hover:bg-muted-foreground/10"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-24 z-50 bg-background/95 backdrop-blur md:hidden">
            <nav className="container py-4">
              <ul className="flex flex-col space-y-1 p-1">
                {isSignedIn && navItems.map((item) => {
                  const isActive = isActiveLink(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center justify-center space-x-2 p-4 border-t">
                <div className="flex items-center space-x-2">
                  <ModeToggle />
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full",
                        userButtonPopoverCard: "rounded-3xl",
                        userButtonPopoverActions: "rounded-3xl",
                        userButtonPopoverActionButton: "rounded-full",
                        userButtonPopoverFooter: "rounded-b-3xl"
                      }
                    }}
                  />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}