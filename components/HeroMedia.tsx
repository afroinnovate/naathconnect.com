import Image from "next/image";
import { ExampleFlow } from "./ExampleFlow";

type LoopVideo = {
  mp4: string;
  webm?: string;
  poster: string;
};

/**
 * Hero visual. Pass a muted looping video later.
 * With no video, the stage shows Tango's photo and the example animation.
 */
export function HeroMedia({ video = null }: { video?: LoopVideo | null }) {
  return (
    <div className="hero-media">
      {video ? (
        <video className="hero-video" muted autoPlay loop playsInline poster={video.poster} preload="none">
          {video.webm ? <source src={video.webm} type="video/webm" /> : null}
          <source src={video.mp4} type="video/mp4" />
        </video>
      ) : null}
      <div className={video ? "hero-still is-secondary" : "hero-still"}>
        <Image
          src="/images/tango/tango-tech-consultation.jpg"
          alt="Tango Tew at his desk."
          width={1122}
          height={1402}
          priority
          sizes="(min-width: 900px) 280px, 70vw"
        />
      </div>
      <ExampleFlow />
    </div>
  );
}
