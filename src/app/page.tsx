import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Work from "@/components/Work";
import Marquee from "@/components/Marquee";
import OffTheClock from "@/components/OffTheClock";
import Contact from "@/components/Contact";
import Motion from "@/components/Motion";

export default function Page() {
  return (
    <>
      <Loader />
      <canvas id="thread" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Work />
        <Marquee />
        <OffTheClock />
        <Contact />
      </main>
      <Motion />
    </>
  );
}