"use client"

type Props = {
  url: string
}

export function VideoPlayer({ url }: Props) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <video className="h-full w-full" controls playsInline preload="metadata">
        <source src={url} type="application/x-mpegURL" />
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
