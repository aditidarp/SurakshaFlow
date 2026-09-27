<div className="video-section">
  <h3>Safety Video</h3>

  {content.videos?.map((v, i) => (
    <iframe
      key={i}
      src={v}
      width="100%"
      height="250"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Safety Video"
    />
  ))}
</div>
