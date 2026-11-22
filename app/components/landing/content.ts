// Структура лендинга и контакты. Тексты на всех языках — в copy.ts.

export const programmeMeta = [
  { num: "I.", img: "/landingpage/1.png", variant: "arch" as const },
  { num: "II.", img: "/landingpage/2.png", variant: "featured" as const },
  { num: "III.", img: "/landingpage/3.png", variant: "plain" as const },
];

export const stepsMeta = [{ n: "01" }, { n: "02" }, { n: "03" }, { n: "04", final: true }];

export const pastWeddingImgs = [
  "/landingpage/slaider/1.png",
  "/landingpage/slaider/2.png",
  "/landingpage/slaider/3.png",
  "/landingpage/slaider/4.png",
  "/landingpage/slaider/5.png",
];

export const roleMeta = [
  { rot: "-9deg", left: "0px", tone: "cream" as const },
  { rot: "-3deg", left: "70px", tone: "gold" as const },
  { rot: "3deg", left: "140px", tone: "dark" as const },
  { rot: "9deg", left: "210px", tone: "cream" as const },
];

export const NEXT_EVENT = { date: "13.02.2027", time: "16:00", price: "€140" };

export const PHONE = "+37125172252";
export const WHATSAPP_URL = "https://wa.me/37125172252";
export const INSTAGRAM_URL = "https://www.instagram.com/fakeweddingeu/";
