// Тексты и данные лендинга (пока только LV — как в макете).

export const programme = [
  {
    num: "I.",
    title: "Ceremonija un svētki",
    text: "Ceremonija, tosti, pirmā deja un pārsteigumi. Tu esi visa vakara daļa, nevis malā stāvošs skatītājs.",
    img: "/landingpage/1.png",
    variant: "arch" as const,
  },
  {
    num: "II.",
    title: "Iejūties stāstā",
    text: "Pirms vakara tu saņem savu stāstu ar pagātni un noslēpumu. Cik daudz atklāt, izlem pats.",
    img: "/landingpage/2.png",
    variant: "featured" as const,
  },
  {
    num: "III.",
    title: "Jaunas pazīšanās",
    text: "Galds, pilns ar svešiniekiem, kuri līdz desertam vairs tādi nebūs. Labākais iemesls iepazīties Rīgā.",
    img: "/landingpage/3.png",
    variant: "plain" as const,
  },
];

export const steps = [
  { n: "01", title: "Rezervē vietu", text: "Viesu skaits ir ierobežots, katrs vakars tiek veidots ap konkrētiem cilvēkiem." },
  { n: "02", title: "Saņem ielūgumu", text: "Personīgs ielūgums ar visu, kas jāzina: kur, kad un kā ierasties." },
  { n: "03", title: "Uzzini savu stāstu", text: "Tavs stāsts, tava pagātne un iemesls saposties tieši tā." },
  { n: "04", title: "Nāc uz kāzām", text: "Vakariņas, mūzika un sarunas līdz vēlai naktij. Pārējais notiks pats.", final: true },
];

export const pastWeddings = [
  { date: "13.02 · 01", caption: "Pirmā deja", img: "/landingpage/slaider/1.png" },
  { date: "02", caption: "Par jaunlaulātajiem!", img: "/landingpage/slaider/2.png" },
  { date: "03", caption: "Aiz maskas", img: "/landingpage/slaider/3.png" },
  { date: "04", caption: "Noslēpums", img: "/landingpage/slaider/4.png" },
  { date: "13.02 · 05", caption: "Vakara dejas", img: "/landingpage/slaider/5.png" },
];

export const roles = [
  { tag: "VIESIS Nr. 03", title: "Onkulis no Liepājas", secret: "slepeni ieveda karaoke pirms tostiem", rot: "-9deg", left: "0px", tone: "cream" as const },
  { tag: "VIESIS Nr. 07", title: "Līgavas bijusī labākā draudzene", secret: "glabā vēstules no līgavaiņa", rot: "-3deg", left: "70px", tone: "gold" as const },
  { tag: "VIESIS Nr. 12", title: "Fotogrāfs, kurš zina pārāk daudz", secret: "redzējis visu, ko nevajadzēja", rot: "3deg", left: "140px", tone: "dark" as const },
  { tag: "VIESIS Nr. ??", title: "Tu.", secret: "Uzzināsi pirms vakara", rot: "9deg", left: "210px", tone: "cream" as const },
];

export const faq = [
  {
    q: "Kas ir iekļauts cenā?",
    a: "Personīgs ielūgums, tava loma, vakariņas un mūzika līdz vēlai naktij. Dzērienus vari atnest līdzi pats.",
  },
  {
    q: "Vai var nākt vienam?",
    a: "Jā, lielākā daļa viesu ierodas vieni. Vakara laikā tu viegli iepazīsi citus, jo katram ir savs stāsts.",
  },
  {
    q: "Vai jāprot runāt tostus?",
    a: "Nē. Stāsts ir vienkāršs, un vadītāji palīdz katram iejusties. Pietiek ar vēlmi.",
  },
  {
    q: "Kāds ir dress code?",
    a: "Svinīgs vakara stils. Tumšie toņi, melna, vīnsarkana vai zeltaina krāsa labi iederas kāzu tēmai.",
  },
  {
    q: "Vai ir vecuma ierobežojums?",
    a: "Jā, pasākums ir tikai 18+. Ielūgumu saņem pilngadīgie viesi.",
  },
];

export const PHONE = "+37125172252";
export const WHATSAPP_URL = "https://wa.me/37125172252";
export const INSTAGRAM_URL = "https://www.instagram.com/fakeweddingeu/";
