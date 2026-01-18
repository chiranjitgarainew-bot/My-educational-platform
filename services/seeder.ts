import { Chapter } from '../types';
import { userDb } from './db';

export const seedClass8Data = async () => {
  // Check if Class 8 chapters already exist to avoid duplication
  const hasData = await userDb.hasChapters('8');
  if (hasData) {
    return;
  }

  const chapters: Chapter[] = [];
  let idCounter = 1000;

  // Helper to add chapters
  const addCh = (subject: string, title: string, order: number) => {
    chapters.push({
      id: `seed_8_${idCounter++}`,
      batchId: '8',
      subject,
      title,
      description: title.includes('Coming Soon') ? 'This chapter content is coming soon.' : 'Start learning this chapter.',
      order
    });
  };

  // --- Subject 1: গণিত (Mathematics) ---
  const math = 'গণিত (Mathematics)';
  addCh(math, 'Chapter 01: INTRODUCTION CLASS', 1);
  addCh(math, 'Chapter 02: পূর্বপাঠের পুনরালোচনা (Coming Soon)', 2);
  addCh(math, 'Chapter 03: পাই চিত্র (Coming Soon)', 3);
  addCh(math, 'Chapter 04: মূলদ সংখ্যার ধারণা (Coming Soon)', 4);
  addCh(math, 'Chapter 05: বহুপদী সংখ্যামালার গুণ ও ভাগ (Coming Soon)', 5);
  addCh(math, 'Chapter 06: ঘনফল নির্ণয় (Coming Soon)', 6);
  addCh(math, 'Chapter 07: পূরক কোণ, সম্পূরক কোণ ও সন্নিহিত কোণ (Coming Soon)', 7);
  addCh(math, 'Chapter 08: বিপ্রতীপ কোণের ধারণা (Coming Soon)', 8);
  addCh(math, 'Chapter 09: সমান্তরাল সরলরেখা ও ছেদকের ধর্ম (Coming Soon)', 9);
  addCh(math, 'Chapter 10: ত্রিভুজের দুটি বাহু ও তাদের বিপরীত কোণের সম্পর্ক (Coming Soon)', 10);
  addCh(math, 'Chapter 11: ত্রৈরাশিক (Coming Soon)', 11);
  addCh(math, 'Chapter 12: শতকরা (Coming Soon)', 12);
  addCh(math, 'Chapter 13: মিশ্রণ (Coming Soon)', 13);
  addCh(math, 'Chapter 14: বীজগাণিতিক সংখ্যামালার উৎপাদকে বিশ্লেষণ (Coming Soon)', 14);
  addCh(math, 'Chapter 15: বীজগাণিতিক সংখ্যামালার গ.সা.গু. ও ল.সা.গু. (Coming Soon)', 15);
  addCh(math, 'Chapter 16: বীজগাণিতিক সংখ্যামালার সরলীকরণ (Coming Soon)', 16);
  addCh(math, 'Chapter 17: ত্রিভুজের কোণ ও বাহুর মধ্যে সম্পর্কের যাচাই (Coming Soon)', 17);
  addCh(math, 'Chapter 18: সময় ও কার্য (Coming Soon)', 18);
  addCh(math, 'Chapter 19: লেখচিত্র (Coming Soon)', 19);
  addCh(math, 'Chapter 20: সমীকরণ গঠন ও সমাধান (Coming Soon)', 20);
  addCh(math, 'Chapter 21: জ্যামিতিক প্রমাণ (Coming Soon)', 21);
  addCh(math, 'Chapter 22: ত্রিভুজ অঙ্কন (Coming Soon)', 22);
  addCh(math, 'Chapter 23: সমান্তরাল সরলরেখা অঙ্কন (Coming Soon)', 23);
  addCh(math, 'Chapter 24: প্রদত্ত সরলরেখাংশকে সমান তিনটি, পাঁচটি ভাগে বিভক্ত করা (Coming Soon)', 24);

  // --- Subject 2: জীবন বিজ্ঞান (Life Science) ---
  const ls = 'জীবন বিজ্ঞান (Life Science)';
  addCh(ls, 'Chapter 01: INTRODUCTION CLASS', 1);
  addCh(ls, 'Chapter 02: প্রাদুর্ভাব, মহামারি ও অতিমারি (Coming Soon)', 2);
  addCh(ls, 'Chapter 03: জীবদেহের গঠন (Coming Soon)', 3);
  addCh(ls, 'Chapter 04: অণুজীবের জগৎ (Coming Soon)', 4);
  addCh(ls, 'Chapter 05: মানুষের খাদ্য ও খাদ্য উৎপাদন (Coming Soon)', 5);
  addCh(ls, 'Chapter 06: অন্তঃক্ষরা গ্রন্থি ও বয়ঃসন্ধি (Coming Soon)', 6);
  addCh(ls, 'Chapter 07: জীববৈচিত্র্য, পরিবেশের সংকট ও বিপন্ন প্রাণী সংরক্ষণ (Coming Soon)', 7);
  addCh(ls, 'Chapter 08: আমাদের চারপাশের পরিবেশ ও উদ্ভিদজগৎ (Coming Soon)', 8);

  // --- Subject 3: ভৌত বিজ্ঞান (Physical Science) ---
  const ps = 'ভৌত বিজ্ঞান (Physical Science)';
  addCh(ps, 'Chapter 01: বল ও চাপ (Coming Soon)', 1);
  addCh(ps, 'Chapter 02: স্পর্শ ছাড়া ক্রিয়াশীল বল (Coming Soon)', 2);
  addCh(ps, 'Chapter 03: তাপ (Coming Soon)', 3);
  addCh(ps, 'Chapter 04: আলো (Coming Soon)', 4);
  addCh(ps, 'Chapter 05: মৌল, যৌগ ও রাসায়নিক বিক্রিয়া (Coming Soon)', 5);
  addCh(ps, 'Chapter 06: কয়েকটি গ্যাসের পরিচিতি (Coming Soon)', 6);
  addCh(ps, 'Chapter 07: প্রকৃতিতে ও জীবজগতে বিভিন্ন রূপে কার্বন যৌগের অবস্থান (Coming Soon)', 7);
  addCh(ps, 'Chapter 08: প্রাকৃতিক ঘটনা ও তার বিশ্লেষণ (Coming Soon)', 8);

  // Inject into DB
  await userDb.seedChapters(chapters);
  console.log('Class 8 Chapters Seeded successfully.');
};

export const seedClass9Data = async () => {
  // Check if Class 9 chapters already exist
  const hasData = await userDb.hasChapters('9');
  if (hasData) {
    return;
  }

  const chapters: Chapter[] = [];
  let idCounter = 9000;

  // Helper to add chapters
  const addCh = (subject: string, title: string, order: number) => {
    chapters.push({
      id: `seed_9_${idCounter++}`,
      batchId: '9',
      subject,
      title,
      description: title.includes('Coming Soon') ? 'This chapter content is coming soon.' : 'Start learning this chapter.',
      order
    });
  };

  // --- Subject 1: গণিত (Mathematics) ---
  const math = 'গণিত (Mathematics)';
  addCh(math, 'Chapter 01: INTRODUCTION CLASS', 1);
  addCh(math, 'Chapter 02: বাস্তব সংখ্যা (Real Numbers) (Coming Soon)', 2);
  addCh(math, 'Chapter 03: সূচকের নিয়মাবলি (Coming Soon)', 3);
  addCh(math, 'Chapter 04: লেখচিত্র (Coming Soon)', 4);
  addCh(math, 'Chapter 05: স্থানাঙ্ক জ্যামিতি (Coming Soon)', 5);
  addCh(math, 'Chapter 06: রৈখিক সহ সমীকরণ (দুই চল বিশিষ্ট) (Coming Soon)', 6);
  addCh(math, 'Chapter 07: সামান্তরিকের ধর্ম (Coming Soon)', 7);
  addCh(math, 'Chapter 08: বহুপদী সংখ্যামালা (Coming Soon)', 8);
  addCh(math, 'Chapter 09: উৎপাদকে বিশ্লেষণ (Coming Soon)', 9);
  addCh(math, 'Chapter 10: ভেদক ও মধ্যবিন্দু সংক্রান্ত উপপাদ্য (Coming Soon)', 10);
  addCh(math, 'Chapter 11: লাভ ও ক্ষতি (Coming Soon)', 11);
  addCh(math, 'Chapter 12: রাশি বিজ্ঞান (Coming Soon)', 12);
  addCh(math, 'Chapter 13: ক্ষেত্রফল সংক্রান্ত উপপাদ্য (Coming Soon)', 13);
  addCh(math, 'Chapter 14: সম্পাদ্যঃ ত্রিভুজের সমান ক্ষেত্রফল বিশিষ্ট সামান্তরিক অঙ্কন (যার একটি কোণের পরিমাপ নির্দিষ্ট)', 14);
  addCh(math, 'Chapter 15: সম্পাদ্যঃ চতুর্ভুজের সমান ক্ষেত্রফল বিশিষ্ট ত্রিভুজ অঙ্কন (Coming Soon)', 15);
  addCh(math, 'Chapter 16: ত্রিভুজ ও চতুর্ভুজের পরিসীমা ও ক্ষেত্রফল (Coming Soon)', 16);
  addCh(math, 'Chapter 17: বৃত্তের পরিধি (Coming Soon)', 17);
  addCh(math, 'Chapter 18: সমবিন্দু সংক্রান্ত উপপাদ্য (Coming Soon)', 18);
  addCh(math, 'Chapter 19: বৃত্তের ক্ষেত্রফল (Coming Soon)', 19);
  addCh(math, 'Chapter 20: স্থানাঙ্ক জ্যামিতিঃ সরল রেখাংশের অন্তর্বিভক্ত ও বহিঃবিভক্ত (Coming Soon)', 20);
  addCh(math, 'Chapter 21: স্থানাঙ্ক জ্যামিতিঃ ত্রিভুজাকৃতি ক্ষেত্রের ক্ষেত্রফল (Coming Soon)', 21);
  addCh(math, 'Chapter 22: লগারিদম (Coming Soon)', 22);

  // --- Subject 2: জীবন বিজ্ঞান (Life Science) ---
  const ls = 'জীবন বিজ্ঞান (Life Science)';
  addCh(ls, 'Chapter 01: INTRODUCTION CLASS', 1);
  addCh(ls, 'Chapter 02: জীবন ও তার বৈচিত্র (Coming Soon)', 2);
  addCh(ls, 'Chapter 03: জীবন সংগঠনের স্তর (Coming Soon)', 3);
  addCh(ls, 'Chapter 04: জৈবনিক প্রক্রিয়া (Coming Soon)', 4);
  addCh(ls, 'Chapter 05: জীববিদ্যা ও মানবকল্যাণ (Coming Soon)', 5);
  addCh(ls, 'Chapter 06: পরিবেশ ও তার সম্পদ (Coming Soon)', 6);

  // --- Subject 3: ভৌত বিজ্ঞান (Physical Science) ---
  const ps = 'ভৌত বিজ্ঞান (Physical Science)';
  addCh(ps, 'Chapter 01: INTRODUCTION CLASS', 1);
  addCh(ps, 'Chapter 02: পরিমাপ (Coming Soon)', 2);
  addCh(ps, 'Chapter 03: বল ও গতি (Coming Soon)', 3);
  addCh(ps, 'Chapter 04: গঠন ও ধর্ম (Coming Soon)', 4);
  addCh(ps, 'Chapter 05: পরমাণুর গঠন (Coming Soon)', 5);
  addCh(ps, 'Chapter 06: মোল ধারণা (Mole Concept) (Coming Soon)', 6);
  addCh(ps, 'Chapter 07: দ্রবণ (Coming Soon)', 7);
  addCh(ps, 'Chapter 08: অ্যাসিড, ক্ষার ও লবণ (Coming Soon)', 8);
  addCh(ps, 'Chapter 09: মিশ্রণের উপাদানের পৃথকীকরণ (Coming Soon)', 9);
  addCh(ps, 'Chapter 10: জল (Coming Soon)', 10);
  addCh(ps, 'Chapter 11: কার্যক্ষমতা ও শক্তি (Coming Soon)', 11);
  addCh(ps, 'Chapter 12: তাপ (Coming Soon)', 12);
  addCh(ps, 'Chapter 13: শব্দ (Coming Soon)', 13);

  // Inject into DB
  await userDb.seedChapters(chapters);
  console.log('Class 9 Chapters Seeded successfully.');
};

export const seedClass10Data = async () => {
  // Check if Class 10 chapters already exist
  const hasData = await userDb.hasChapters('10');
  if (hasData) {
    return;
  }

  const chapters: Chapter[] = [];
  let idCounter = 10000;

  // Helper to add chapters
  const addCh = (subject: string, title: string, order: number) => {
    chapters.push({
      id: `seed_10_${idCounter++}`,
      batchId: '10',
      subject,
      title,
      description: title.includes('Coming Soon') ? 'This chapter content is coming soon.' : 'Start learning this chapter.',
      order
    });
  };

  // --- Subject 1: গণিত (Mathematics) ---
  const math = 'গণিত (Mathematics)';
  addCh(math, 'Chapter 01: INTRODUCTION CLASS (Coming Soon)', 1);
  addCh(math, 'Chapter 02: একচলবিশিষ্ট দ্বিঘাত সমীকরণ (Coming Soon)', 2);
  addCh(math, 'Chapter 03: সরল সুদকষা (Coming Soon)', 3);
  addCh(math, 'Chapter 04: বৃত্ত সম্পর্কিত উপপাদ্য (Theorems related to Circle) (Coming Soon)', 4);
  addCh(math, 'Chapter 05: আয়তঘন (Rectangular Parallelepiped / Cuboid) (Coming Soon)', 5);
  addCh(math, 'Chapter 06: অনুপাত ও সমানুপাত (Ratio and Proportion) (Coming Soon)', 6);
  addCh(math, 'Chapter 07: চক্রবৃদ্ধি সুদ (৩ বছর পর্যন্ত) ও সমহার বৃদ্ধি বা হ্রাস (Coming Soon)', 7);
  addCh(math, 'Chapter 08: বৃত্তস্থ কোণ সম্পর্কিত উপপাদ্য (Coming Soon)', 8);
  addCh(math, 'Chapter 09: লম্ববৃত্তাকার চোঙ (Coming Soon)', 9);
  addCh(math, 'Chapter 10: দ্বিঘাত করণী (Coming Soon)', 10);
  addCh(math, 'Chapter 11: বৃত্তস্থ চতুর্ভুজ সংক্রান্ত উপপাদ্য (Coming Soon)', 11);
  addCh(math, 'Chapter 12: সম্পাদ্যঃ ত্রিভুজের পরিবৃত্ত ও অন্তর্বৃত্ত অঙ্কন (Coming Soon)', 12);
  addCh(math, 'Chapter 13: গোলক (Coming Soon)', 13);
  addCh(math, 'Chapter 14: ভেদ (Coming Soon)', 14);
  addCh(math, 'Chapter 15: অংশীদারি কারবার (Coming Soon)', 15);
  addCh(math, 'Chapter 16: বৃত্তের স্পর্শক সংক্রান্ত উপপাদ্য (Coming Soon)', 16);
  addCh(math, 'Chapter 17: লম্ববৃত্তাকার শম্ভু (Right Circular Cone) (Coming Soon)', 17);
  addCh(math, 'Chapter 18: সম্পাদ্যঃ বৃত্তের স্পর্শক অঙ্কন (Coming Soon)', 18);
  addCh(math, 'Chapter 19: সাদৃশতা (Similarity) (Coming Soon)', 19);
  addCh(math, 'Chapter 20: বিভিন্ন ঘনবস্তু সংক্রান্ত বাস্তব সমস্যা (Coming Soon)', 20);
  addCh(math, 'Chapter 21: ত্রিকোণমিতিক কোণ পরিমাপের ধারণা (Coming Soon)', 21);
  addCh(math, 'Chapter 22: সম্পাদ্যঃ মধ্যসমানুপাতী নির্ণয় (Coming Soon)', 22);
  addCh(math, 'Chapter 23: পিথাগোরাসের উপপাদ্য (Coming Soon)', 23);
  addCh(math, 'Chapter 24: ত্রিকোণমিতিক অনুপাত ও ত্রিকোণমিতিক অভেদাবলি (Coming Soon)', 24);
  addCh(math, 'Chapter 25: পূরক কোণের ত্রিকোণমিতিক অনুপাত (Coming Soon)', 25);
  addCh(math, 'Chapter 26: ত্রিকোণমিতিক অনুপাতের প্রয়োগ (উচ্চতা ও দূরত্ব) (Coming Soon)', 26);
  addCh(math, 'Chapter 27: রাশিবিজ্ঞান (Statistics) (Coming Soon)', 27);

  // --- Subject 2: জীবন বিজ্ঞান (Life Science) ---
  const ls = 'জীবন বিজ্ঞান (Life Science)';
  addCh(ls, 'Chapter 01: INTRODUCTION CLASS', 1);
  addCh(ls, 'Chapter 02: জীবজগতে নিয়ন্ত্রণ ও সমন্বয় (Coming Soon)', 2);
  addCh(ls, 'Chapter 03: জীবনের প্রবাহমানতা (Coming Soon)', 3);
  addCh(ls, 'Chapter 04: বংশগতি ও কয়েকটি সাধারণ জিনগত রোগ (Coming Soon)', 4);
  addCh(ls, 'Chapter 05: অভিব্যক্তি ও অভিযোজন (Coming Soon)', 5);
  addCh(ls, 'Chapter 06: পরিবেশ, তার সম্পদ এবং তাদের সংরক্ষণ (Coming Soon)', 6);

  // --- Subject 3: ভৌত বিজ্ঞান (Physical Science) ---
  const ps = 'ভৌত বিজ্ঞান (Physical Science)';
  addCh(ps, 'Chapter 01: INTRODUCTION CLASS', 1);
  addCh(ps, 'Chapter 02: পরিবেশের জন্য ভাবনা (Coming Soon)', 2);
  addCh(ps, 'Chapter 03: গ্যাসের আচরণ (Coming Soon)', 3);
  addCh(ps, 'Chapter 04: রাসায়নিক গণনা (Coming Soon)', 4);
  addCh(ps, 'Chapter 05: তাপের ঘটনাসমূহ (Coming Soon)', 5);
  addCh(ps, 'Chapter 06: আলো (Coming Soon)', 6);
  addCh(ps, 'Chapter 07: চলতড়িৎ (Coming Soon)', 7);
  addCh(ps, 'Chapter 08: পরমাণুর নিউক্লিয়াস (Coming Soon)', 8);
  addCh(ps, 'Chapter 09: পর্যায় সারণি ও মৌলদের ধর্মের পর্যায়বৃত্ততা (Coming Soon)', 9);
  addCh(ps, 'Chapter 10: আয়নীয় ও সমযোজী বন্ধন (Coming Soon)', 10);
  addCh(ps, 'Chapter 11: তড়িৎ প্রবাহ ও রাসায়নিক বিক্রিয়া (Coming Soon)', 11);
  addCh(ps, 'Chapter 12: পরীক্ষাগার ও রাসায়নিক শিল্পে অজৈব রসায়ন (Coming Soon)', 12);
  addCh(ps, 'Chapter 13: ধাতুবিদ্যা (Coming Soon)', 13);
  addCh(ps, 'Chapter 14: জৈব রসায়ন (Coming Soon)', 14);

  // Inject into DB
  await userDb.seedChapters(chapters);
  console.log('Class 10 Chapters Seeded successfully.');
};