import styles from "@/styles/App.module.scss";

function toEmbedUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${url.pathname.replace("/", "")}`;
    }
    return videoUrl;
  } catch {
    return videoUrl;
  }
}

export function VideoPlayer({ title, videoUrl }: { title: string; videoUrl: string }) {
  const src = toEmbedUrl(videoUrl);
  const isYouTube = src.includes("youtube.com/embed/");

  if (isYouTube) {
    return (
      <iframe
        className={styles.videoFrame}
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return <video controls src={videoUrl} />;
}
