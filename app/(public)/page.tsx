import HeroSection from "@/components/home/HeroSection";
import QuickTranslateSection from "@/components/home/QuickTranslateSection";
import FeatureSection from "@/components/home/FeatureSection";
import NewsPreviewSection from "@/components/home/NewsPreviewSection";
import LessonPreviewSection from "@/components/home/LessonPreviewSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <HeroSection />
      <QuickTranslateSection />
      <FeatureSection />
      <NewsPreviewSection />
      <LessonPreviewSection />
    </main>
  );
}