"use client";

type NextEventProps = {
  onReserve: () => void;
};

export function NextEvent({ onReserve }: NextEventProps) {
  return (
    <section className="fwWrap fwNextWrap">
      <p className="fwEyebrow">Nākamās kāzas</p>
      <h2>
        Tava vieta <em>pie galda.</em>
      </h2>
      <div className="fwNext">
        <div className="fwNextLeft">
          <div className="fwNextMeta">
            <div>
              <small>Datums</small>
              <strong>13.02.2027</strong>
            </div>
            <div>
              <small>Sākums</small>
              <strong>16:00</strong>
            </div>
            <div>
              <small>Vieta</small>
              <strong className="fwCity">Rīga</strong>
            </div>
          </div>
          <ul className="fwChecks">
            <li>Personīgs ielūgums</li>
            <li>Tavs stāsts</li>
            <li>Vakariņas</li>
            <li>Mūzika līdz vēlai naktij</li>
          </ul>
        </div>
        <div className="fwNextRight">
          <small>Cena</small>
          <p className="fwPrice">€140</p>
          <p className="fwMuted">par personu · vietu skaits ierobežots</p>
          <p className="fwMuted">Tikai 18+</p>
          <button className="fwBtnDark" onClick={onReserve}>
            Rezervēt vietu →
          </button>
        </div>
      </div>
    </section>
  );
}
