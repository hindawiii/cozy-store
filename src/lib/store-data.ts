export type Product = {
  id: string;
  name: string;
  category: string;
  supplierPrice: number;
  sellingPrice: number;
  rating: number;
  stock: number;
  emoji: string;
};

export const categories = [
  { name: "إلكترونيات", emoji: "📱" },
  { name: "ملابس", emoji: "👕" },
  { name: "صحة وجمال", emoji: "💄" },
  { name: "أطفال", emoji: "🧸" },
  { name: "اكسسوارات موبايل", emoji: "🎧" },
  { name: "حيوانات أليفة", emoji: "🐾" },
  { name: "منزل ومطبخ", emoji: "🍳" },
  { name: "رياضة ولياقة", emoji: "🏋️" },
];

const names: [string, string, number, number, string][] = [
  ["سماعة بلوتوث لاسلكية Pro", "إلكترونيات", 89, 149, "🎧"],
  ["ساعة ذكية بشاشة أموليد", "إلكترونيات", 145, 249, "⌚"],
  ["شاحن سريع 65 واط", "اكسسوارات موبايل", 39, 79, "🔌"],
  ["حامل جوال للسيارة مغناطيسي", "اكسسوارات موبايل", 18, 45, "🚗"],
  ["قميص قطن رجالي كاجوال", "ملابس", 55, 110, "👔"],
  ["عباية كاجوال بتصميم عصري", "ملابس", 120, 220, "🧥"],
  ["سيروم فيتامين سي للبشرة", "صحة وجمال", 42, 89, "🧴"],
  ["جهاز تنظيف الوجه الكهربائي", "صحة وجمال", 68, 139, "✨"],
  ["مجموعة ألعاب تعليمية للأطفال", "أطفال", 60, 125, "🧩"],
  ["حقيبة مدرسية مقاومة للماء", "أطفال", 75, 145, "🎒"],
  ["لعبة تفاعلية للقطط", "حيوانات أليفة", 25, 59, "🐈"],
  ["سرير مريح للكلاب الصغيرة", "حيوانات أليفة", 95, 175, "🐕"],
  ["مقلاة هوائية 5 لتر", "منزل ومطبخ", 210, 349, "🍟"],
  ["طقم سكاكين ستانلس ستيل", "منزل ومطبخ", 88, 165, "🔪"],
  ["حبل مقاومة للتمارين المنزلية", "رياضة ولياقة", 30, 69, "💪"],
  ["زجاجة رياضية ذكية 1 لتر", "رياضة ولياقة", 35, 75, "🥤"],
];

export const products: Product[] = names.map(
  ([name, category, supplierPrice, sellingPrice, emoji], i) => ({
    id: `p-${i + 1}`,
    name,
    category,
    supplierPrice,
    sellingPrice,
    rating: 3.8 + ((i * 7) % 12) / 10,
    stock: 12 + ((i * 37) % 200),
    emoji,
  }),
);

export const profitPct = (p: Product) =>
  Math.round(((p.sellingPrice - p.supplierPrice) / p.sellingPrice) * 100);
