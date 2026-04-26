import Navbar from "@/components/Navbar";
import HeroHeader from "@/components/HeroHeader";
import FeaturedNews from "@/components/FeaturedNews";
import SchoolCalendar from "@/components/SchoolCalendar";
import PhotoGallery from "@/components/PhotoGallery";
import StudentWork from "@/components/StudentWork";
import WeeklyPoll from "@/components/WeeklyPoll";
import BulletinBoard from "@/components/BulletinBoard";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <HeroHeader />
    <main className="flex-1 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0))]">
      <FeaturedNews />
      <SchoolCalendar />
      <PhotoGallery />
      <StudentWork />
      <WeeklyPoll />
      <BulletinBoard />
    </main>
    <Footer />
  </div>
);

export default Index;
