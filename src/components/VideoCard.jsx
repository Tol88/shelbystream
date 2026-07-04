import { Link } from "react-router-dom";
import { useState } from "react";

const avatarColor = (author) =>
  `hsl(${parseInt(author?.slice(1, 4) || "0", 36) % 360}, 60%, 45%)`;

export default function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    if (video.videoUrl) {
      sessionStorage.setItem(`videoUrl-${video.id}`, video.videoUrl);
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
        <div className="video-card-body">
          <AvatarEl />
          <div>
            <p className="video-title">{video.title}</p>
            <p className="video-author">{video.author}</p>
            <p className="video-views">{video.views}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-card">
      <div className="thumb thumb-clickable" style={{ background: video.color }}>
        <span className={`price-tag ${video.free ? "price-free" : ""}`}>
          {video.price}
        </span>
        {video.videoUrl && (
          <button className="thumb-play-btn" onClick={() => setPlaying(true)}>▶</button>
        )}
        <span className="duration-tag">{video.duration}</span>
      </div>
      <Link to={`/watch/${video.id}`} onClick={handleClick} className="video-card-body">
        <AvatarEl />
        <div>
          <p className="video-title">{video.title}</p>
          <p className="video-author">{video.author}</p>
          <p className="video-views">{video.views}</p>
        </div>
      </Link>
    </div>
  );
}