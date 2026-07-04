import VideoCard from "./VideoCard";

export default function VideoSection({ title, videos }) {
  return (
    <section className="video-section">
      <div className="section-head">
        <h2>{title}</h2>
        <a href="#" className="see-all">Lihat semua</a>
      </div>
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}