import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Work from "@/components/Work";
import Stats from "@/components/Stats";
import Projects from "@/components/Projects";
import OpenSource from "@/components/OpenSource";
import Journey from "@/components/Journey";
import About from "@/components/About";
import OffTheClock from "@/components/OffTheClock";
import Contact from "@/components/Contact";
import Motion from "@/components/Motion";
import { getAllStats, getMergedPRs, getNextRace } from "@/lib/stats";

// Re-render on the server at most once an hour; all fetches are cached for the same window.
export const revalidate = 3600;

export default async function Page() {
  const [stats, prs, nextRace] = await Promise.all([getAllStats(), getMergedPRs(), getNextRace()]);
  return (
    <>
      <Loader />
      <canvas id="thread" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Work />
        <Stats stats={stats} />
        <Projects />
        <OpenSource prs={prs} />
        <Journey />
        <About />
        <OffTheClock chess={stats.chess} nextRace={nextRace} />
        <Contact />
      </main>
      <Motion />
    </>
  );
}
