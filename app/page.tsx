"use client";
import Background from "@/components/background";
import Link from "next/link";

export default function Home() {
  const buttonData = [
    {
      children: "spotify",
      href: "https://open.spotify.com/artist/33IUlB3VxN8hnkdspcLk7v",
      target: "_blank",
    },
    {
      children: "apple music",
      href: "https://music.apple.com/fr/artist/literally-the-moon/1736386562",
      target: "_blank",
    },
    {
      children: "bandcamp",
      href: "https://literallythemoon.bandcamp.com/",
      target: "_blank",
    },
    {
      children: "soundcloud",
      href: "https://soundcloud.com/literally-the-moon",
      target: "_blank",
    },
    {
      children: "tiktok",
      href: "https://www.tiktok.com/@literallymoonmusic",
      target: "_blank",
    },
    {
      children: "instagram",
      href: "https://www.instagram.com/literallymoonmusic/",
      target: "_blank",
    },
    {
      children: "email",
      href: "mailto:literallythemoonmusic@gmail.com",
      target: "_blank",
    },
  ];

  return (
    <>
      <Background />
      <main className="relative flex-grow flex min-h-screen flex-col justify-between z-10 p-4 bg-stone-950/20">
        <div className="absolute bottom-4 right-4 text-white opacity-85">
          <h1 className="text-2xl md:text-4xl tracking-wider font-light">
            literally the moon
          </h1>
        </div>
        <div className="max-w-screen-sm">
          <div className="flex flex-col gap-6">
            {buttonData.map((props, index) => (
              <Link
                key={index}
                {...props}
                className="w-full text-white font-light tracking-wider text-lg"
              >
                {props.children}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
