import "./HeroBg.css";

type HeroProps = { onReserve: () => void };

export function Hero({ onReserve }: HeroProps) {
  return (
    <section className="fwHero">
      <div className="fwHeroImg" aria-hidden="true" />
      <div className="fwHeroShade" aria-hidden="true" />
      <div className="fwHeroBody">
        <p className="fwEyebrow fwEyebrowLight">Kāzu vakars pieaugušajiem · Rīga</p>
        <h1>
          Viņi satiekas
          <br />
          pirmo reizi.
          <br />
          <em>Pie altāra.</em>
        </h1>
        <p className="fwLead">
          Tu saņem personīgu ielūgumu un iemeslu saposties. Vakariņas, mūzika un sarunas līdz vēlai naktij, viss kā
          īstās kāzās.
        </p>
        <div className="fwCtas">
          <button className="fwBtnGold" onClick={onReserve}>
            Rezervēt vietu →
          </button>
          <a className="fwBtnGhost" href="#how">
            Kā tas notiek?
          </a>
        </div>
      </div>
    </section>
  );
}
