import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily Workout",
    short_name: "Workout",
    description: "Daily workout tracker",
    start_url: "/training",
    scope: "/",
    display: "standalone",
    background_color: "#171719",
    theme_color: "#171719",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
