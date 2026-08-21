import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Products from "@/components/Products";
import About from "@/components/About";
import Partners from "@/components/Partners";
import Testimonials from "@/components/Testimonials";
import Maps from "@/components/Maps";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full overflow-x-hidden">
        <Hero />
        <Services />
        <Products />
        <About />
        <Partners />
        <Testimonials />
        <Maps />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
