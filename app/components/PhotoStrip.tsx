export function PhotoStrip() {
  return (
    <section className="photoStrip" aria-label="Атмосфера вечера">
      <div className="photoCanvas wrap">
        <figure className="polaroid photoLeft"><div className="photoImage" /></figure>
        <figure className="polaroid photoCenter"><div className="photoImage" /><figcaption>Одна<br />свадьба<br />Много<br />историй <span>♡</span></figcaption></figure>
        <figure className="polaroid photoRight"><div className="photoImage" /></figure>
        <span className="photoHeart" aria-hidden="true">♡</span>
      </div>
    </section>
  );
}
