import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import { BookOpen, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { Book } from '../catalog/CatalogPage';
import HeroParticles from '../../components/ui/HeroParticles';
import ImageBox from '../../../../components/originkit/ui/gallery-tunnel';
import BookCarousel from './BookCarousel';

import CatalogPage from '../catalog/CatalogPage';
import { smoothScrollTo } from '../../lib/scroll';

export default function HomePage() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch default catalog page to make navigation instant
    queryClient.prefetchQuery({
      queryKey: ['catalog', 'sort=popularity&page=0&size=20&workGrouped=true'],
      queryFn: async () => {
        const res = await apiClient.get('/books/catalog?sort=popularity&page=0&size=20&workGrouped=true');
        return res.data.data;
      }
    });
    // Prefetch facets
    queryClient.prefetchQuery({
      queryKey: ['facets', ''],
      queryFn: async () => {
        const res = await apiClient.get('/books/facets?');
        return res.data.data;
      }
    });
  }, [queryClient]);

  // Fetch Featured Books
  const { data: featuredBooksPage, isSuccess: isFeaturedSuccess } = useQuery<{ content: Book[] }>({
    queryKey: ['featured-books'],
    queryFn: async () => {
      const res = await apiClient.get('/books?featured=true&size=50&active=true');
      return res.data.data;
    }
  });

  // Fetch Trending Books (sort by views desc)
  const { data: trendingBooksPage, isSuccess: isTrendingSuccess } = useQuery<{ content: Book[] }>({
    queryKey: ['trending-books'],
    queryFn: async () => {
      const res = await apiClient.get('/books?sort=views,desc&size=50&active=true');
      return res.data.data;
    }
  });

  // Fetch Recommended Books
  const { data: recommendedBooks } = useQuery<Book[]>({
    queryKey: ['recommended-books'],
    queryFn: async () => {
      const res = await apiClient.get('/books/recommended');
      return res.data.data;
    }
  });

  // Calculate tunnel images synchronously if cached, preventing 3D scene tear-downs
  const tunnelImages = useMemo(() => {
    if (!isFeaturedSuccess && !isTrendingSuccess) return [];
    
    const images = Array.from(
      new Map(
        [
          ...(featuredBooksPage?.content ?? []),
          ...(trendingBooksPage?.content ?? []),
        ].map(b => [b.coverUrl, b])
      ).values()
    ).map(b => ({
      src: b.coverUrl
        ? (b.coverUrl.startsWith('http') ? b.coverUrl : `http://localhost:8080${b.coverUrl}`)
        : '',
    }));

    // Preload the first few images to improve perceived performance
    images.slice(0, 8).forEach(img => {
      if (!img.src) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });

    return images;
  }, [isFeaturedSuccess, isTrendingSuccess, featuredBooksPage, trendingBooksPage]);



  return (
    <div className="animate-fade-in">
      {/* ── Hero Section (Gallery Tunnel background) ─────────── */}
      <section
        className="relative overflow-hidden min-h-[100dvh] flex flex-col justify-center -mt-32 pt-32"
        aria-label="Welcome to Bookmarq"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <ImageBox
            images={tunnelImages}
            background="#1c150e"
            lineColor="#c5a059"
            lineOpacity={30}
            colors={['#1c150e']}
            grid={3}
            speed={50}
            boost={280}
            fade={70}
            label={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {/* Particle overlay — dust motes, bokeh & lamp glow on top of tunnel */}
        <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
          <HeroParticles />
        </div>

        {/* Dark vignette so hero text stays readable */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(28,21,14,0.55) 0%, rgba(28,21,14,0.82) 100%)',
              'linear-gradient(to bottom, rgba(28,21,14,0.6) 0%, transparent 30%, transparent 70%, rgba(28,21,14,0.7) 100%)',
            ].join(', '),
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
              <span className="text-sm text-[var(--color-text-muted)]">Your next great read awaits</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Books That{' '}
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)] bg-clip-text text-transparent">
                Illuminate
              </span>{' '}
              Your Mind
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-muted)]">
              Browse our curated collection of fiction, science, technology, and more.
              From timeless classics to modern bestsellers all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('catalog-section');
                  if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY;
                    smoothScrollTo(y, 700); // 0.7s cinematic scroll
                  }
                }}
                className="btn btn-primary px-8 py-3 text-base"
              >
                Browse Catalog
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a href="/?sort=newest#catalog-section" className="btn btn-secondary px-8 py-3 text-base">
                New Arrivals
              </a>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0"
          style={{ height: '120px', background: 'linear-gradient(to top, var(--color-bg-primary), transparent)' }}
          aria-hidden="true"
        />
      </section>

      {/* Dynamic Carousels */}
      <div id="browse-section" className="pt-8 -mt-8">
      {featuredBooksPage?.content && featuredBooksPage.content.length > 0 && (
        <BookCarousel 
          title="Featured Books" 
          subtitle="Handpicked selections from our team."
          books={featuredBooksPage.content}
        />
      )}

      {trendingBooksPage?.content && trendingBooksPage.content.length > 0 && (
        <BookCarousel 
          title="Trending Right Now" 
          subtitle="See what everyone else is reading."
          books={trendingBooksPage.content}
          viewAllLink="/?sort=views,desc#catalog-section"
        />
      )}

      {recommendedBooks && recommendedBooks.length > 0 && (
        <BookCarousel 
          title="Recommended for You" 
          subtitle="Based on your reading history and preferences."
          books={recommendedBooks}
        />
      )}
      </div>

      {/* ── Catalog Section ─────────────────────────────────── */}
      <div id="catalog-section">
        <CatalogPage />
      </div>

      {/* ── Feature Highlights ────────────────────────────── */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: '40+ Curated Titles',
                description: 'From Dune to Design Patterns — a carefully selected library across 8 categories.',
              },
              {
                icon: TrendingUp,
                title: 'Personalized Picks',
                description: 'Recommendations based on what readers like you are buying and loving.',
              },
              {
                icon: Sparkles,
                title: 'Secure & Simple',
                description: 'Safe checkout, order tracking, and account management all in one place.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="card flex flex-col items-center text-center">
                <div className="mb-4 rounded-xl bg-[var(--color-bg-surface)] p-3">
                  <Icon className="h-6 w-6 text-[var(--color-accent)]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
