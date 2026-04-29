import Nav from "@/components/public/Nav";
import Hero from "@/components/public/Hero";
import VideoReel from "@/components/public/VideoReel";
import TheSpace from "@/components/public/TheSpace";
import Pricing from "@/components/public/Pricing";
import Equipment from "@/components/public/Equipment";
import Amenities from "@/components/public/Amenities";
import FAQ from "@/components/public/FAQ";
import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <VideoReel />
        <TheSpace />
        <Pricing />
        <Equipment />
        <Amenities />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
