const categories = [
  { name: "Blockchain", count: "124 videos", color: "#dde8e3" },
  { name: "AI & Machine Learning", count: "98 videos", color: "#dde2f3" },
  { name: "Web3 Development", count: "76 videos", color: "#f3e6d4" },
  { name: "NFT & Digital Art", count: "54 videos", color: "#f1e2f0" },
  { name: "DeFi", count: "43 videos", color: "#f6e3d6" },
  { name: "Security", count: "31 videos", color: "#dcefe0" },
];

export default function Categories() {
  return (
    <main className="container">
      <h1 className="page-title">Categories</h1>
      <div className="categories-grid">
        {categories.map((cat, i) => (
          <div key={i} className="category-card" style={{ background: cat.color }}>
            <h2>{cat.name}</h2>
            <p>{cat.count}</p>
          </div>
        ))}
      </div>
    </main>
  );
}