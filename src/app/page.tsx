

import React from "react";
import SectionHero from "@/server-components/SectionHero";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionOurFeatures from "@/components/SectionOurFeatures";
import BackgroundSection from "@/components/BackgroundSection";
import SectionGridFeaturePlaces from "@/components/SectionGridFeaturePlaces";
import SectionHowItWork from "@/components/SectionHowItWork";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionBecomeAnAuthor from "@/components/SectionBecomeAnAuthor";
import SectionVideos from "@/components/SectionVideos";
import SectionClientSay from "@/components/SectionClientSay";
import Chatbot from '@/components/chatbot'




function PageHome() {

  return (
    <main className="nc-PageHome relative overflow-hidden">
      {/* GLASSMOPHIN */}
      <BgGlassmorphism />

      <div className="container relative space-y-24 mb-24 lg:space-y-28 lg:mb-28">
        {/* SECTION HERO */}
        <SectionHero className="pt-10 lg:pt-16 lg:pb-16" />


        <SectionOurFeatures />

        <SectionGridFeaturePlaces headingIsCenter="" cardType="card2" />

        <SectionHowItWork />

        <div className="relative py-16">
          
        </div>

        <SectionSubscribe2 />

        

        <div className="relative py-16">
          <BackgroundSection />
          <SectionBecomeAnAuthor />
        </div>

       

        <SectionVideos />

        <div className="relative py-16">
          <BackgroundSection />
          <SectionClientSay />
        </div>
        <div className="flex fixed justify-end items-center z-50">
        <Chatbot/>
      </div>
      </div>
    </main>
  );
}

export default PageHome;
