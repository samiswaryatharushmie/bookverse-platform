import { useQuery } from '@tanstack/react-query';
import apiClient from '@/modules/common/lib/apiClient';
import { Tag } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PromotionDto {
  code: string;
  discountPercentage: number;
  bannerText: string;
}

export default function PromoBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  const { data: banners } = useQuery<PromotionDto[]>({
    queryKey: ['active-banners'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/promotions/active-banner');
        return res.data.data;
      } catch (e) {
        return [];
      }
    },
    retry: false
  });

  useEffect(() => {
    if (banners && banners.length > 0 && bannerRef.current) {
      const height = bannerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--promo-banner-height', `${height}px`);
      
      return () => {
        document.documentElement.style.removeProperty('--promo-banner-height');
      };
    }
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const banner = banners[0];

  return (
    <div ref={bannerRef} className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)] text-[var(--color-bg-base)] text-sm font-medium py-2 px-4 flex justify-center items-center gap-2 fixed top-0 w-full z-[60] shadow-md">
      <Tag className="h-4 w-4" />
      <span>{banner.bannerText || `Use code ${banner.code} for ${banner.discountPercentage}% off!`}</span>
    </div>
  );
}
