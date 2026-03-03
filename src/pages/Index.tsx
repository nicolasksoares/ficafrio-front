import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ForCompanies } from "@/components/home/ForCompanies";
import { NavBar } from "@/components/NavBar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <ForCompanies />
      </main>
    </div>
  );
};

export default Index;
