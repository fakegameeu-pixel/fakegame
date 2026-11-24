"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import "./fakeWedding.css";
import "./landing/Buttons.css";
import "./ChooseRole.css";
import "./CandidateForm.css";
import { Header } from "./landing/Header";
import { useI18n } from "../lib/i18n";

const MAX_VIDEO_BYTES = 300 * 1024 * 1024;

const copy = {
  lv: {
    eyebrow: "Anketa",
    title: ["Līgavainis", "vai līgava."],
    intro: "Šī anketa ir pieteikums piedalīties Fake Wedding vakarā kā līgavainim vai līgavai. Aizpildi datus un pievieno īsu video vizītkarti, lai mēs varētu tevi iepazīt.",
    roleLegend: "Kas tu vēlies būt?",
    roleGroom: "Līgavainis",
    roleBride: "Līgava",
    firstName: "Vārds",
    lastName: "Uzvārds",
    phone: "Tālrunis",
    email: "E-pasts",
    birthDate: "Dzimšanas datums",
    height: "Augums, cm",
    weight: "Svars, kg",
    shoe: "Kājas izmērs (EU)",
    videoLabel: "Video vizītkarte",
    videoPick: "Izvēlēties video failu",
    videoHint: "MP4, MOV vai WebM",
    mb: "MB",
    videoRules: "Pastāsti: no kurienes tu esi, kur strādā, kādi ir tavi hobiji un kāpēc tieši tu varētu kļūt par līgavaini vai līgavu.",
    consentBefore: "Piekrītu ",
    consentLink: "personas datu apstrādei",
    consentAfter: ".",
    submit: "Nosūtīt anketu →",
    next: "Tālāk →",
    back: "← Atpakaļ",
    stepOf: (n: number) => `Solis ${n} no 3`,
    sending: "Sūtām…",
    uploading: "Augšupielādējam video. Tas var aizņemt dažas minūtes…",
    saving: "Saglabājam anketu…",
    done: { eyebrow: "Gatavs", title: ["Anketa", "nosūtīta."], lead: "Paldies! Mēs apskatīsim video vizītkarti un sazināsimies ar tevi pa e-pastu vai tālruni." },
    errors: {
      NO_VIDEO: "Augšupielādē video vizītkarti.",
      VIDEO_SIZE: "Video nedrīkst būt lielāks par 300 MB.",
      VIDEO_TYPE: "Augšupielādē video MP4, MOV vai WebM formātā.",
      VIDEO_EMPTY: "Video nav saņemts. Izvēlies failu vēlreiz.",
      VIDEO_REQUIRED: "Augšupielādē video vizītkarti.",
      VIDEO_NOT_FOUND: "Video nav atrasts. Augšupielādē to vēlreiz.",
      VIDEO_UPLOAD_FAILED: "Neizdevās nosūtīt video serverim. Pārbaudi savienojumu un mēģini vēlreiz.",
      ROLE_REQUIRED: "Izvēlies, kas tu vēlies būt: līgavainis vai līgava.",
      NAME_REQUIRED: "Ievadi vārdu un uzvārdu.",
      PHONE_INVALID: "Ievadi derīgu tālruni.",
      EMAIL_INVALID: "Ievadi derīgu e-pastu.",
      BIRTH_DATE_INVALID: "Norādi dzimšanas datumu. Dalībniekam jābūt vismaz 18 gadus vecam.",
      HEIGHT_INVALID: "Norādi augumu centimetros (no 100 līdz 250).",
      WEIGHT_INVALID: "Norādi svaru kilogramos (no 30 līdz 250).",
      SHOE_INVALID: "Norādi kājas izmēru (no 20 līdz 60).",
      CONSENT_REQUIRED: "Vajadzīga piekrišana personas datu apstrādei.",
      SERVER_UNREACHABLE: "Neizdevās sazināties ar serveri. Pārbaudi savienojumu un mēģini vēlreiz.",
      SAVE_FAILED: "Neizdevās saglabāt anketu. Mēģini vēlreiz.",
    },
  },
  ru: {
    eyebrow: "Анкета",
    title: ["Жених", "или невеста."],
    intro: "Эта анкета — заявка на участие в вечере Fake Wedding в роли жениха или невесты. Заполни данные и загрузи короткую видеовизитку, чтобы мы могли тебя узнать.",
    roleLegend: "Кем хочешь стать?",
    roleGroom: "Жених",
    roleBride: "Невеста",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Телефон",
    email: "E-mail",
    birthDate: "Дата рождения",
    height: "Рост, см",
    weight: "Вес, кг",
    shoe: "Размер ноги (EU)",
    videoLabel: "Видеовизитка",
    videoPick: "Выбрать видеофайл",
    videoHint: "MP4, MOV или WebM",
    mb: "МБ",
    videoRules: "Расскажи: откуда ты, кем работаешь, какие у тебя хобби и почему именно ты должен стать женихом или невестой.",
    consentBefore: "Согласен на обработку ",
    consentLink: "персональных данных",
    consentAfter: ".",
    submit: "Отправить анкету →",
    next: "Далее →",
    back: "← Назад",
    stepOf: (n: number) => `Шаг ${n} из 3`,
    sending: "Отправляем…",
    uploading: "Загружаем видео. Это может занять несколько минут…",
    saving: "Сохраняем анкету…",
    done: { eyebrow: "Готово", title: ["Анкета", "отправлена."], lead: "Спасибо! Мы посмотрим видеовизитку и свяжемся с тобой по e-mail или телефону." },
    errors: {
      NO_VIDEO: "Загрузите видеовизитку.",
      VIDEO_SIZE: "Видео должно быть не больше 300 МБ.",
      VIDEO_TYPE: "Загрузите видео в формате MP4, MOV или WebM.",
      VIDEO_EMPTY: "Видео не получено. Выберите файл ещё раз.",
      VIDEO_REQUIRED: "Загрузите видеовизитку.",
      VIDEO_NOT_FOUND: "Видео не найдено. Загрузите его ещё раз.",
      VIDEO_UPLOAD_FAILED: "Не удалось отправить видео на сервер. Проверьте соединение и попробуйте ещё раз.",
      ROLE_REQUIRED: "Выберите, кого вы хотите стать: жених или невеста.",
      NAME_REQUIRED: "Введите имя и фамилию.",
      PHONE_INVALID: "Введите корректный телефон.",
      EMAIL_INVALID: "Введите корректный e-mail.",
      BIRTH_DATE_INVALID: "Укажите дату рождения. Участникам должно быть не меньше 18 лет.",
      HEIGHT_INVALID: "Укажите рост в сантиметрах (от 100 до 250).",
      WEIGHT_INVALID: "Укажите вес в килограммах (от 30 до 250).",
      SHOE_INVALID: "Укажите размер ноги (от 20 до 60).",
      CONSENT_REQUIRED: "Нужно согласие на обработку персональных данных.",
      SERVER_UNREACHABLE: "Не удалось связаться с сервером. Проверьте, что сайт запущен, и попробуйте ещё раз.",
      SAVE_FAILED: "Не удалось сохранить анкету. Попробуйте ещё раз.",
    },
  },
  en: {
    eyebrow: "Application",
    title: ["Groom", "or bride."],
    intro: "This form is an application to take part in the Fake Wedding evening as the groom or bride. Fill in your details and upload a short video intro so we can get to know you.",
    roleLegend: "Who would you like to be?",
    roleGroom: "Groom",
    roleBride: "Bride",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    email: "E-mail",
    birthDate: "Date of birth",
    height: "Height, cm",
    weight: "Weight, kg",
    shoe: "Shoe size (EU)",
    videoLabel: "Video introduction",
    videoPick: "Choose a video file",
    videoHint: "MP4, MOV or WebM",
    mb: "MB",
    videoRules: "Tell us: where you are from, what you do for work, your hobbies, and why you should become the groom or bride.",
    consentBefore: "I agree to the processing of ",
    consentLink: "personal data",
    consentAfter: ".",
    submit: "Send application →",
    next: "Next →",
    back: "← Back",
    stepOf: (n: number) => `Step ${n} of 3`,
    sending: "Sending…",
    uploading: "Uploading the video. This may take a few minutes…",
    saving: "Saving your application…",
    done: { eyebrow: "Done", title: ["Application", "sent."], lead: "Thank you! We will review your video and contact you by e-mail or phone." },
    errors: {
      NO_VIDEO: "Upload your video introduction.",
      VIDEO_SIZE: "The video must be no larger than 300 MB.",
      VIDEO_TYPE: "Upload a video in MP4, MOV or WebM format.",
      VIDEO_EMPTY: "The video was not received. Choose the file again.",
      VIDEO_REQUIRED: "Upload your video introduction.",
      VIDEO_NOT_FOUND: "The video was not found. Upload it again.",
      VIDEO_UPLOAD_FAILED: "Could not send the video to the server. Check your connection and try again.",
      ROLE_REQUIRED: "Choose whether you want to be the groom or the bride.",
      NAME_REQUIRED: "Enter your first and last name.",
      PHONE_INVALID: "Enter a valid phone number.",
      EMAIL_INVALID: "Enter a valid e-mail.",
      BIRTH_DATE_INVALID: "Enter your date of birth. Participants must be at least 18 years old.",
      HEIGHT_INVALID: "Enter your height in centimetres (100 to 250).",
      WEIGHT_INVALID: "Enter your weight in kilograms (30 to 250).",
      SHOE_INVALID: "Enter your shoe size (20 to 60).",
      CONSENT_REQUIRED: "Consent to the processing of personal data is required.",
      SERVER_UNREACHABLE: "Could not reach the server. Make sure the site is running and try again.",
      SAVE_FAILED: "Could not save the application. Please try again.",
    },
  },
};

type Copy = (typeof copy)["ru"];

export function CandidateForm() {
  const { locale } = useI18n();
  const t: Copy = copy[locale] ?? copy.lv;
  const [file, setFile] = useState<File>();
  const [step, setStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Текст ошибки по коду; если кода нет в словаре, показываем запасной текст.
  const errorText = (code: string | undefined, fallback: keyof Copy["errors"]) =>
    (code && (t.errors as Record<string, string>)[code]) || t.errors[fallback];

  function selectVideo(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    setError("");
    if (picked && picked.size > MAX_VIDEO_BYTES) {
      setFile(undefined);
      setError(t.errors.VIDEO_SIZE);
      return;
    }
    setFile(picked);
  }

  function validateStep(index: number, form: FormData, hasFile: boolean, agreed: boolean): keyof Copy["errors"] | null {
    const text = (name: string) => String(form.get(name) ?? "").trim();
    if (index === 0) {
      return text("role") ? null : "ROLE_REQUIRED";
    }
    if (index === 1) {
      if (!text("firstName") || !text("lastName")) return "NAME_REQUIRED";
      const phone = text("phone").replace(/[\s()-]/g, "");
      if (!/^\+?\d{8,15}$/.test(phone)) return "PHONE_INVALID";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text("email"))) return "EMAIL_INVALID";
      return null;
    }
    // Шаг 3: дата рождения, параметры, видео и согласие.
    const birth = new Date(text("birthDate"));
    const adultFrom = new Date();
    adultFrom.setFullYear(adultFrom.getFullYear() - 18);
    if (!text("birthDate") || Number.isNaN(birth.getTime()) || birth > adultFrom) return "BIRTH_DATE_INVALID";
    const height = Number(text("height"));
    if (!text("height") || height < 100 || height > 250) return "HEIGHT_INVALID";
    const weight = Number(text("weight"));
    if (!text("weight") || weight < 30 || weight > 250) return "WEIGHT_INVALID";
    const shoe = Number(text("shoeSize"));
    if (!text("shoeSize") || shoe < 20 || shoe > 60) return "SHOE_INVALID";
    if (!hasFile) return "NO_VIDEO";
    if (!agreed) return "CONSENT_REQUIRED";
    return null;
  }

  function goNext() {
    const formEl = stepRefs.current[step]?.closest("form");
    if (!formEl) return;
    const code = validateStep(step, new FormData(formEl), !!file, consent);
    if (code) {
      setError(t.errors[code]);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, 2));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    // Enter на первых шагах только переводит на следующий шаг.
    if (step < 2) {
      goNext();
      return;
    }
    // Читаем поля до первого await: после него event.currentTarget уже недоступен.
    const form = new FormData(event.currentTarget);
    for (const index of [0, 1, 2]) {
      const code = validateStep(index, form, !!file, consent);
      if (code) {
        setStep(index);
        setError(t.errors[code]);
        return;
      }
    }
    setLoading(true);
    try {
      setStatus(t.uploading);
      let upload: Response;
      try {
        upload = await fetch("/api/candidates/video", {
          method: "POST",
          headers: { "Content-Type": file.type, "X-File-Size": String(file.size) },
          body: file,
        });
      } catch (uploadError) {
        console.error("Video upload failed", uploadError);
        throw new Error(t.errors.SERVER_UNREACHABLE);
      }
      const uploaded = (await upload.json().catch(() => ({}))) as { path?: string; code?: string };
      if (!upload.ok || !uploaded.path) throw new Error(errorText(uploaded.code, "VIDEO_UPLOAD_FAILED"));

      setStatus(t.saving);
      let response: Response;
      try {
        response = await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            role: form.get("role"),
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            phone: form.get("phone"),
            email: form.get("email"),
            birthDate: form.get("birthDate"),
            height: form.get("height"),
            weight: form.get("weight"),
            shoeSize: form.get("shoeSize"),
            website: form.get("website"),
            consent,
            videoPath: uploaded.path,
          }),
        });
      } catch (saveError) {
        console.error("Candidate save failed", saveError);
        throw new Error(t.errors.SERVER_UNREACHABLE);
      }
      const body = (await response.json().catch(() => ({}))) as { code?: string };
      if (!response.ok) throw new Error(errorText(body.code, "SAVE_FAILED"));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.SAVE_FAILED);
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <main className="fw fwChoose">
      <Header onReserve={() => { window.location.href = "/"; }} homeHref="/" />
      <div className="fwWrap fwChooseWrap">
        {done ? (
          <section className="fwChoosePanel fwChooseDone">
            <p className="fwEyebrowLight">{t.done.eyebrow}</p>
            <h1 className="fwChooseTitle">{t.done.title[0]} <em>{t.done.title[1]}</em></h1>
            <p className="fwChooseLead">{t.done.lead}</p>
          </section>
        ) : (
          <section className="fwChoosePanel">
            <div className="fwStepHead">
              <p className="fwEyebrowLight">{t.eyebrow}</p>
              <span className="fwStepText">{t.stepOf(step + 1)}</span>
            </div>
            <h1 className="fwChooseTitle">{t.title[0]} <em>{t.title[1]}</em></h1>
            <p className="fwChooseLead">{t.intro}</p>
            <form className="fwChooseForm" onSubmit={submit} noValidate>
              <div ref={(el) => { stepRefs.current[0] = el; }} hidden={step !== 0}>
              <fieldset>
                <legend>{t.roleLegend}</legend>
                <label className="fwChooseRadio">
                  <input type="radio" name="role" value="groom" required />
                  <span>{t.roleGroom}</span>
                </label>
                <label className="fwChooseRadio">
                  <input type="radio" name="role" value="bride" required />
                  <span>{t.roleBride}</span>
                </label>
              </fieldset>
              </div>

              <div ref={(el) => { stepRefs.current[1] = el; }} hidden={step !== 1}>
              <div className="fwChooseRow">
                <label>
                  {t.firstName}
                  <input name="firstName" required autoComplete="given-name" />
                </label>
                <label>
                  {t.lastName}
                  <input name="lastName" required autoComplete="family-name" />
                </label>
              </div>

              <div className="fwChooseRow">
                <label>
                  {t.phone}
                  <input name="phone" type="tel" required autoComplete="tel" placeholder="+371" />
                </label>
                <label>
                  {t.email}
                  <input name="email" type="email" required autoComplete="email" />
                </label>
              </div>

              </div>

              <div ref={(el) => { stepRefs.current[2] = el; }} hidden={step !== 2}>
              <label>
                {t.birthDate}
                <input name="birthDate" type="date" required autoComplete="bday" />
              </label>

              <div className="fwChooseRow">
                <label>
                  {t.height}
                  <input name="height" type="number" inputMode="numeric" min={100} max={250} required />
                </label>
                <label>
                  {t.weight}
                  <input name="weight" type="number" inputMode="decimal" min={30} max={250} required />
                </label>
              </div>

              <label>
                {t.shoe}
                <input name="shoeSize" type="number" inputMode="decimal" min={20} max={60} step="0.5" required />
              </label>

              <div className="fwVideoField">
                <span className="fwCandidateVideoTitle">{t.videoLabel}</span>
                <label className="fwFileButton">
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={selectVideo} required />
                  <span className="fwFileButtonIcon" aria-hidden="true">▶</span>
                  <span className="fwFileButtonText">{file ? file.name : t.videoPick}</span>
                  <span className="fwFileButtonHint">{file ? `${(file.size / 1024 / 1024).toFixed(1)} ${t.mb}` : t.videoHint}</span>
                </label>
                <ul className="fwVideoRules">
                  <li>{t.videoRules}</li>
                </ul>
              </div>

              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />

              <label className="fwChooseConsent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
                <span>
                  {t.consentBefore}<a href="/privacy-policy" target="_blank" rel="noopener noreferrer">{t.consentLink}</a>{t.consentAfter}
                </span>
              </label>

              </div>

              {status && <p className="fwChooseLead">{status}</p>}
              {error && <p className="fwChooseError" role="alert">{error}</p>}
              <div className="fwChooseNav">
                {step > 0 && (
                  <button type="button" className="fwBtnGhostDark" disabled={loading} onClick={() => setStep((current) => current - 1)}>
                    {t.back}
                  </button>
                )}
                {step < 2 ? (
                  <button type="button" className="fwBtnGold" onClick={goNext}>
                    {t.next}
                  </button>
                ) : (
                  <button className="fwBtnGold" disabled={loading || !consent}>
                    {loading ? t.sending : t.submit}
                  </button>
                )}
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
