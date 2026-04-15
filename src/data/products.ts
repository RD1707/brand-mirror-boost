export interface Product {
  id: number;
  name: string;
  line: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  slug: string;
  description?: string;
  rating: number;
  reviewCount: number;
  category: string;
  installments?: string;
}

export const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Egeo Dolce Desodorante Colônia 90ml",
    line: "Egeo",
    price: 139.90,
    originalPrice: 169.90,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594035910387-fbc370765ad8?w=600&h=600&fit=crop",
    ],
    badge: "17% OFF",
    slug: "egeo-dolce-desodorante-colonia-90ml",
    description: "Egeo Dolce é uma fragrância feminina gourmand irresistível. Com notas de chocolate branco, baunilha e sândalo, ela envolve com doçura e sensualidade. Ideal para o dia a dia e ocasiões especiais.",
    rating: 4.7,
    reviewCount: 1243,
    category: "Perfumaria",
    installments: "4x de R$ 34,97",
  },
  {
    id: 2,
    name: "Nativa SPA Ameixa Negra Loção Hidratante 400ml",
    line: "Nativa SPA",
    price: 89.90,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=600&h=600&fit=crop",
    ],
    slug: "nativa-spa-ameixa-negra-locao-hidratante-400ml",
    description: "Loção desodorante hidratante corporal Nativa SPA Ameixa Negra. Fórmula com óleos nutritivos que proporcionam hidratação intensa por até 24 horas, deixando a pele macia e perfumada.",
    rating: 4.8,
    reviewCount: 856,
    category: "Corpo e Banho",
    installments: "3x de R$ 29,96",
  },
  {
    id: 3,
    name: "Lily Eau de Parfum 75ml",
    line: "Lily",
    price: 199.90,
    originalPrice: 249.90,
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&h=600&fit=crop",
    ],
    badge: "20% OFF",
    slug: "lily-eau-de-parfum-75ml",
    description: "Lily Eau de Parfum é uma fragrância sofisticada e envolvente. Com notas de lírio, gardênia e musk, é perfeita para mulheres que buscam elegância e feminilidade em cada detalhe.",
    rating: 4.9,
    reviewCount: 2105,
    category: "Perfumaria",
    installments: "6x de R$ 33,31",
  },
  {
    id: 4,
    name: "Make B. Base Líquida HD 30ml",
    line: "Make B.",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop",
    ],
    slug: "make-b-base-liquida-hd-30ml",
    description: "Base líquida com cobertura HD de alta definição. Textura leve que uniformiza o tom da pele com acabamento natural. Longa duração de até 12 horas.",
    rating: 4.5,
    reviewCount: 678,
    category: "Maquiagem",
    installments: "2x de R$ 39,95",
  },
  {
    id: 5,
    name: "Cuide-se Bem Beijinho Creme Hidratante 250ml",
    line: "Cuide-se Bem",
    price: 59.90,
    originalPrice: 74.90,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
    ],
    badge: "20% OFF",
    slug: "cuide-se-bem-beijinho-creme-hidratante-250ml",
    description: "Creme hidratante corporal com fragrância doce de beijinho. Fórmula nutritiva que hidrata e perfuma a pele por horas. Textura cremosa de rápida absorção.",
    rating: 4.6,
    reviewCount: 432,
    category: "Corpo e Banho",
    installments: "2x de R$ 29,95",
  },
  {
    id: 6,
    name: "Malbec Desodorante Colônia 100ml",
    line: "Malbec",
    price: 159.90,
    image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=600&h=600&fit=crop",
    ],
    slug: "malbec-desodorante-colonia-100ml",
    description: "Malbec é a fragrância masculina mais vendida do Brasil. Com notas amadeiradas e o exclusivo álcool vínico, traz personalidade e sofisticação para o homem moderno.",
    rating: 4.8,
    reviewCount: 3421,
    category: "Perfumaria",
    installments: "5x de R$ 31,98",
  },
  {
    id: 7,
    name: "Match Shampoo Nutrição Profunda 250ml",
    line: "Match",
    price: 39.90,
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop",
    ],
    slug: "match-shampoo-nutricao-profunda-250ml",
    description: "Shampoo para cabelos secos e danificados. Fórmula com óleo de argan e proteínas que nutrem profundamente os fios, devolvendo brilho e maciez.",
    rating: 4.4,
    reviewCount: 567,
    category: "Cabelos",
    installments: "1x de R$ 39,90",
  },
  {
    id: 8,
    name: "Floratta Blue Desodorante Colônia 75ml",
    line: "Floratta",
    price: 119.90,
    originalPrice: 149.90,
    image: "https://images.unsplash.com/photo-1594035910387-fbc370765ad8?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fbc370765ad8?w=600&h=600&fit=crop",
    ],
    badge: "20% OFF",
    slug: "floratta-blue-desodorante-colonia-75ml",
    description: "Floratta Blue é uma fragrância feminina fresca e delicada. Suas notas florais de peônia e frésia combinam com a leveza do musk branco, perfeita para o dia a dia.",
    rating: 4.6,
    reviewCount: 987,
    category: "Perfumaria",
    installments: "3x de R$ 39,96",
  },
];

export const brandHighlightProducts: Product[] = [
  {
    id: 9,
    name: "Nativa SPA Quinoa Loção Firmadora 400ml",
    line: "Nativa SPA",
    price: 94.90,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=300&h=300&fit=crop",
    slug: "nativa-spa-quinoa-locao-firmadora-400ml",
    description: "Loção firmadora corporal com quinoa e óleos essenciais. Promove firmeza e elasticidade à pele com uso contínuo.",
    rating: 4.7,
    reviewCount: 345,
    category: "Corpo e Banho",
  },
  {
    id: 10,
    name: "Lily Absolu Eau de Parfum 75ml",
    line: "Lily",
    price: 249.90,
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=300&h=300&fit=crop",
    slug: "lily-absolu-eau-de-parfum-75ml",
    description: "A versão mais intensa e sofisticada de Lily. Notas de lírio, rosa e baunilha criam uma fragrância marcante e inesquecível.",
    rating: 4.9,
    reviewCount: 1567,
    category: "Perfumaria",
  },
  {
    id: 11,
    name: "Egeo Beat Desodorante Colônia 90ml",
    line: "Egeo",
    price: 149.90,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop",
    slug: "egeo-beat-desodorante-colonia-90ml",
    description: "Egeo Beat traz energia e vibração. Fragrância unissex com notas frutais e amadeiradas, perfeita para quem busca autenticidade.",
    rating: 4.5,
    reviewCount: 789,
    category: "Perfumaria",
  },
  {
    id: 12,
    name: "Malbec Gold Desodorante Colônia 100ml",
    line: "Malbec",
    price: 179.90,
    image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=300&h=300&fit=crop",
    slug: "malbec-gold-desodorante-colonia-100ml",
    description: "A sofisticação do Malbec em sua versão mais luxuosa. Notas de uva Malbec envelhecida em barris de carvalho francês.",
    rating: 4.8,
    reviewCount: 2134,
    category: "Perfumaria",
  },
];

export const allProducts = [...featuredProducts, ...brandHighlightProducts];
