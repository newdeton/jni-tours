import Hero from "../../components/home/Hero/Hero";
import TourSearch from "../../components/home/TourSearch/TourSearch";
import FeaturedTours from "../../components/home/FeaturedTours/FeaturedTours";
import DestinationsPreview from "../../components/home/DestinationsPreview/DestinationsPreview";
import WhyChooseUs from "../../components/home/WhyChooseUs/WhyChooseUs";
import Testimonials from "../../components/home/Testimonials/Testimonials";


import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <Hero />

      <TourSearch />

      <FeaturedTours />

      <DestinationsPreview />

      <WhyChooseUs />

      <Testimonials />
    </div>
  );
}

export default Home;