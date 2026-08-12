import { LandingHero } from "@/components/landing/hero";
import { LandingMethods } from "@/components/landing/methods";
import { LandingPreview } from "@/components/landing/preview";
import { LandingThesis } from "@/components/landing/thesis";

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <LandingThesis />
      <LandingPreview />
      <LandingMethods />
    </>
  );
}
