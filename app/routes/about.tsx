import { Image, Video } from "@shopify/hydrogen";
import testimonial1 from "../assets/about-us/hero.jpg";

export default function About() {
  return (
    <div className="about">
        <div className="hero py-16 flex flex-col items-center justify-center">
            <div className="container  max-w-[1200px]">
            <h1 className="text-title-h3 md:text-title-h1 text-center text-text-sub-600">juntos por uma alimentação saudável, prática e cheia de sabor para você!</h1>
            <Image className="rounded-3xl" src={testimonial1} alt="Testimonial 1" />
            </div>
        </div>
        <div className="flex flex-col items-center justify-center">
            <div className="container  max-w-[1200px]">
            <h1 className="text-title-h3 md:text-title-h1 text-center text-text-sub-600">o que é a sua mesa fit?</h1>
                
            </div>
        </div>
      
    </div>
  );
} 