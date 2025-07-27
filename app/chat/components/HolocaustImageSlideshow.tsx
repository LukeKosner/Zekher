"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { SlideImage } from "../types";

const images: SlideImage[] = [
  {
    src: "/eelco-bohtlingk-gGT876GkSm0-unsplash.jpg",
    alt: "Holocaust Memorial",
    question: "How do we remember the Holocaust?",
    photographerName: "Eelco Bohtlingk",
    photographerUrl:
      "https://unsplash.com/@eelco_bohtlingk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash",
    unsplashUrl:
      "https://unsplash.com/photos/grayscale-photo-of-concrete-building-gGT876GkSm0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
  },
  {
    src: "/darshan-gajara-LJOyziXadvg-unsplash.jpg",
    alt: "Bunk beds",
    question: "Tell me about life in concentration camps.",
    photographerName: "Darshan Gajara",
    photographerUrl:
      "https://unsplash.com/@weirdowizard?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash",
    unsplashUrl:
      "https://unsplash.com/photos/stones-on-ground-LJOyziXadvg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
  },
  {
    src: "/jean-carlo-emer-JdoWy1eo6BE-unsplash.jpg",
    alt: "Memorial site",
    question: "What was it like to enter Auschwitz?",
    photographerName: "Jean Carlo Emer",
    photographerUrl:
      "https://unsplash.com/@jeancarloemer?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash",
    unsplashUrl:
      "https://unsplash.com/photos/brown-wooden-fence-during-daytime-JdoWy1eo6BE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
  },
  {
    src: "/joseph-dYNRtckOYGE-unsplash.jpg",
    alt: "Memorial sculpture",
    question: "Tell me about Holocaust art.",
    photographerName: "Joseph",
    photographerUrl:
      "https://unsplash.com/@josephcsoti?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash",
    unsplashUrl:
      "https://unsplash.com/photos/a-statue-of-a-person-sitting-on-a-bench-dYNRtckOYGE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
  },
  {
    src: "/marcin-czerniawski-m9Re9iUq08s-unsplash.jpg",
    alt: "Historical memorial",
    question: "What authority enabled the Holocaust?",
    photographerName: "Marcin Czerniawski",
    photographerUrl:
      "https://unsplash.com/@marcin777?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash",
    unsplashUrl:
      "https://unsplash.com/photos/gray-concrete-building-m9Re9iUq08s?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
  }
];

interface HolocaustImageSlideshowProps {
  onQuestionClick?: (question: string) => void;
}

export function HolocaustImageSlideshow({
  onQuestionClick
}: HolocaustImageSlideshowProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [isMobile, setIsMobile] = React.useState(false);
  const [autoplayReady, setAutoplayReady] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    // Delay autoplay start to prevent initial flash
    const timer = setTimeout(() => {
      setAutoplayReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [api]);

  const handleImageClick = (question: string) => {
    if (onQuestionClick) {
      onQuestionClick(question);
    }
  };

  return (
    <div
      className={cn(
        "w-full sm:max-w-md md:max-w-4xl mx-auto flex flex-col items-center justify-center"
      )}
    >
      <Carousel
        setApi={setApi}
        orientation="horizontal"
        opts={{
          align: "start",
          loop: true
        }}
        plugins={
          autoplayReady
            ? [
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true
                })
              ]
            : []
        }
        className="w-full"
      >
        <CarouselContent className={isMobile ? "h-[70vh]" : ""}>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div
                className="relative overflow-hidden rounded-lg cursor-pointer aspect-[3/4] md:aspect-[16/9]"
                onClick={() => handleImageClick(image.question)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Centered question */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-white text-lg md:text-2xl lg:text-3xl font-semibold text-center px-4 md:px-8">
                    {image.question}
                  </h2>
                </div>

                {/* Photo credit badge */}
                <Badge className="absolute bottom-2 md:bottom-3 right-2 md:right-3 max-w-[calc(100%-1rem)]">
                  <span className="text-[9px] md:text-[10px] lg:text-xs flex items-center gap-x-1 flex-wrap">
                    Photo by{" "}
                    <Link
                      className="underline inline-flex items-center gap-0.5 whitespace-nowrap"
                      href={image.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {image.photographerName}
                      <ArrowUpRight className="w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0" />
                    </Link>{" "}
                    on{" "}
                    <Link
                      className="underline inline-flex items-center gap-0.5 whitespace-nowrap"
                      href={image.unsplashUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Unsplash
                      <ArrowUpRight className="w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0" />
                    </Link>
                  </span>
                </Badge>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
