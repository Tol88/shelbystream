import { Link } from "react-router-dom";
import { useState } from "react";

const avatarColor = (author) =>
  `hsl(${parseInt(author?.slice(1, 4) || "0", 36) % 360}, 60%, 45%)`;

export default function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    if (video.videoUrl) {
      sessionStorage.setItem(`videoUrl-${video.id}`, video.videoUrl);
      sessionStorage.setItem(`desc-${video.id}`, video.description || "");
     
    }
  };

  const AvatarEl = () =>
    video.avatar ? (
      <img
        src={video.avatar}
        alt="avatar"
        className="avatar avatar-sm"
        style={{ objectFit: "cover", borderRadius: "50%" }}
      />
    ) : (
      <span
        className="avatar avatar-sm"
        style={{ background: avatarColor(video.author) }}
      >
        {video.initials}
      </span>
    );

  if (playing && video.videoUrl) {
    return (
      <div className="video-card">
        <div className="thumb thumb-player">
          <video
            controls autoPlay
            style={{ width: "100%", height: "100%", borderRadius: "12px", objectFit: "cover" }}
            onEnded={() => setPlaying(false)}
          >
            <source src={video.videoUrl} type="video/mp4" />
          </video>
        </div>
        <div className="video-card-body" style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: "10px" }}>
          <AvatarEl />
          <div style={{ flex: 1 }}>
            <p className="video-title" style={{ color: "#1c1c1c" }}>{video.title}</p>
            <p className="video-author" style={{ color: "#6b6b67" }}>{video.author}</p>
            <p className="video-views" style={{ color: "#6b6b67" }}>{video.views}</p>
          </div>
          <Link
            to={`/watch/${video.id}`}
            onClick={handleClick}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "#1c1c1c", color: "#fff",
              borderRadius: 8, padding: "6px 12px",
              fontSize: 13, fontWeight: 500, marginLeft: "auto", flexShrink: 0
            }}
          >
            ▶ Watch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="video-card">
      <div
        className="thumb thumb-clickable"
        style={{ background: video.color }}
      >
        <span className={`price-tag ${video.free ? "price-free" : ""}`}>
          {video.price}
        </span>
        {video.videoUrl && (
          <button className="thumb-play-btn" onClick={() => setPlaying(true)}>▶</button>
        )}
        <span className="duration-tag">{video.duration}</span>
      </div>
      <div className="video-card-body" style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: "10px" }}>
        <AvatarEl />
        <div style={{ flex: 1 }}>
          <p className="video-title" style={{ color: "#1c1c1c" }}>{video.title}</p>
          <p className="video-author" style={{ color: "#6b6b67" }}>{video.author}</p>
          <p className="video-views" style={{ color: "#6b6b67" }}>{video.views}</p>
        </div>
        <Link
          to={`/watch/${video.id}`}
          onClick={handleClick}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "#1c1c1c", color: "#fff",
            borderRadius: 8, padding: "6px 12px",
            fontSize: 13, fontWeight: 500, marginLeft: "auto", flexShrink: 0
          }}
        >
          ▶ Watch
        </Link>
      </div>
    </div>
  );
}