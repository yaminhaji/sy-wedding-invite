/**
 * Content model + DEFAULT content for the site.
 *
 * Live content is edited from the admin page (/admin) and stored in Vercel Blob
 * (or .data/invite.json locally). These defaults are used until something is saved,
 * and fill in any field that is missing from saved content.
 */

export interface Person {
  name: string;
  /** e.g. "Mr. & Mrs. ..." — empty hides the line */
  parents: string;
  relation: string;
  /** Optional portrait URL */
  photo: string;
  /** Heading for the siblings list, e.g. "Brothers", "Sister", "Siblings" */
  siblingsLabel: string;
  siblings: string[];
}

/** An event as stored/edited: date and time are local to `timeZone`. */
export interface EventContent {
  key: string;
  title: string;
  arabicTitle: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, 24-hour */
  time: string;
  durationHours: number;
  hostedBy: string;
  venue: string;
  address: string;
  /** Optional custom maps link; defaults to a Google Maps search of the address */
  mapUrl: string;
  description: string;
  notes: string[];
}

/** An event as rendered: adds `start` (ISO instant) computed from date + time + timeZone. */
export interface InviteEvent extends EventContent {
  start: string;
}

export interface InviteContent {
  bride: Person;
  groom: Person;
  /** IANA timezone used to display all dates and times */
  timeZone: string;
  city: string;
  events: EventContent[];
  travel: {
    intro: string;
    arrive: { label: string; text: string }[];
    stay: {
      name: string;
      address: string;
      phone: string;
      website: string;
      note: string;
      bookingUrl: string;
    };
  };
  messages: {
    intimateTitle: string;
    intimate: string[];
    receptionTitle: string;
    reception: string;
    announceLead: string;
    announce: string[];
  };
  /** Invite 2 (/save-the-date): sent after the Nikaah — announcement + save the date for the reception */
  saveTheDate: {
    /** "auto" switches from the before- to the after-wording when the Nikaah starts */
    mode: "auto" | "before" | "after";
    /** BEFORE the Nikaah: line under the names + paragraphs */
    preLead: string;
    preParagraphs: string[];
    /** Shown as a short list in both versions, under the heading below */
    reasonsTitle: string;
    reasons: string[];
    title: string;
    /** e.g. "2028" — shown large; the exact date is not known yet */
    when: string;
    eventName: string;
    detail: string;
    closing: string;
    preClosing: string;
  };
  bringNote: string;
  gallery: string[];
  faqs: { q: string; a: string }[];
  contacts: { name: string; phone: string }[];
}

const SAYAJI_ADDRESS =
  "Near Bhimnath Bridge, Opposite Parsi Agyari Ground, Parshuram Nagar, Sayajiganj, Vadodara, Gujarat 390007, India";

export const defaultContent: InviteContent = {
  // The bride is always shown first.
  bride: { name: "Sana Suhel Patel", parents: "Suhel Vali Patel & Rehana Suhel Patel", relation: "daughter of", photo: "",
    siblingsLabel: "Siblings", siblings: ["Ziyad Suhel Patel", "Ibrahim Suhel Patel"] },
  groom: { name: "Yamin Rustam Haji", parents: "Rustam Haji Ibrahim & Shamsunnisa Begum", relation: "son of", photo: "",
    siblingsLabel: "Siblings", siblings: ["Yasin Rustam Haji", "Asna Rustam Haji"] },

  timeZone: "Asia/Kolkata",
  city: "Vadodara, Gujarat",

  events: [
    {
      key: "nikaah-walima",
      title: "Nikaah & Walima",
      arabicTitle: "نكاح و وليمة",
      date: "2026-12-08",
      time: "18:00",
      durationHours: 5,
      hostedBy: "Hosted by both families",
      venue: "Sayaji Hotel Vadodara",
      address: SAYAJI_ADDRESS,
      mapUrl: "",
      description:
        "Join us for the blessed Nikaah, followed by the Walima at the same venue, as we celebrate with family and friends.",
      notes: [
        "Nikaah ceremony begins promptly at {time}",
        "Walima dinner to follow",
        "Please no photos or videos; our photographer will share pictures with everyone",
        "Dress code: whatever suits you (formal, casual or traditional)",
      ],
    },
  ],

  travel: {
    intro:
      "Both the Nikaah and the Walima take place at one location, Sayaji Hotel Vadodara, so guests can stay right at the venue.",
    arrive: [
      { label: "By air", text: "Vadodara Airport (BDQ) is the nearest airport." },
      { label: "By rail", text: "Vadodara Junction railway station is in the Sayajiganj area, close to the hotel." },
    ],
    stay: {
      name: "Sayaji Hotel Vadodara",
      address: SAYAJI_ADDRESS,
      phone: "+91 265 247 6666",
      website: "https://www.sayajihotels.com",
      note: "Rooms can be booked directly with the hotel or online. Please book early.",
      bookingUrl:
        "https://www.booking.com/hotel/in/sayaji-vadodara-vadodara.html?checkin=2026-12-07&checkout=2026-12-09&group_adults=2&no_rooms=1",
    },
  },

  messages: {
    intimateTitle: "A small, intimate gathering",
    intimate: [
      "Over the last few days, a window opened up for us in December, and we decided to take this step with the blessings of our families. Because of the short timeline, we are keeping it small and intimate, with immediate family, relatives and close friends.",
      "We know this is short notice, and your presence and duas would mean the world to us as we begin this new chapter.",
    ],
    receptionTitle: "A reception to follow",
    reception:
      "A reception will follow in the future, and that is where we hope to celebrate this milestone with all our loved ones. We would be honored to have you join us there as well, and we will share details once it is planned.",
    announceLead: "are happy to share that we are now married",
    announce: [
      "Alhamdulillah, a window opened up for us in December, and with the blessings of our families we began this new chapter of our lives. We kept our Nikaah and Walima to a small gathering with our immediate family.",
      "You were very much in our hearts, and we would love to celebrate this milestone with you.",
    ],
  },

  saveTheDate: {
    mode: "auto",
    preLead: "are getting married",
    preParagraphs: [
      "Alhamdulillah, a window opened up for us in December, and with the blessings of our families we have decided to begin this new chapter of our lives. Our Nikaah and Walima will be a small gathering with our immediate family.",
      "You are very much in our hearts, and we would love to celebrate this milestone with you.",
    ],
    reasonsTitle: "Why a small Nikaah",
    reasons: [
      "It came together quickly, and we didn't want to delay our Nikaah.",
      "There wasn't time to plan or manage a large celebration.",
      "It wouldn't be fair to expect everyone to travel at such short notice.",
    ],
    title: "Save the Date",
    when: "2028",
    eventName: "Reception",
    detail:
      "The exact date and venue are still to be decided. We will send you a formal invitation once everything is planned.",
    closing: "Please keep us in your duas as we begin this new chapter.",
    preClosing: "Please keep us in your duas on the day, as we begin this new chapter.",
  },

  bringNote: "Please bring yourselves, and blessings.",

  gallery: [],

  faqs: [
    { q: "What should I bring?", a: "Please bring yourselves, and blessings. Your presence and duas are all we ask." },
    {
      q: "What should I wear?",
      a: "Whatever suits you: formal, semi-formal, casual or traditional. Come as you are comfortable.",
    },
    {
      q: "Can I bring a guest?",
      a: "Our celebrations are by invitation only. Please come with your immediate party only.",
    },
    {
      q: "Will there be a larger celebration?",
      a: "Yes. A reception will follow in the future for all our loved ones, and we will share details once it is planned.",
    },
    {
      q: "Can I take photos?",
      a: "We kindly ask that you don't take photos or videos. We will have a dedicated photographer, and we will share the pictures with everyone.",
    },
    {
      q: "What time should I arrive?",
      a: "Please arrive by {arriveTime}. The Nikaah begins promptly at {time}, followed by the Walima dinner.",
    },
    { q: "Will the food be halal?", a: "Yes, all food served is halal, and vegetarian options will be available." },
    { q: "Is there parking?", a: "Yes, parking is available at {venue}." },
    { q: "Is there a place to pray?", a: "Yes, a prayer area will be available at the venue." },
  ],

  contacts: [{ name: "Family Contact", phone: "+91 00000 00000" }],
};

export const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? "";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "The Day" },
  { href: "/travel", label: "Travel" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
] as const;
