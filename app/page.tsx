"use client";
import Background from "@/components/background";
import Button, { ButtonProps } from "@/components/button";

export default function Home() {
  const buttonData: ButtonProps[] = [
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
      <main className="flex min-h-screen flex-col items-center justify-between z-10 py-24 px-4">
        <div className="w-full max-w-screen-sm flex-grow flex flex-col gap-16 text-center">
          <div className="flex flex-col gap-4 text-white opacity-85">
            <h1 className="text-4xl md:text-6xl tracking-tight">
              literally the moon
            </h1>
          </div>
          <div className="flex flex-col gap-8">
            {buttonData.map((buttonProps, index) => (
              <Button key={index} {...buttonProps} className="w-full" />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
