export interface Product {
  id: number;
  name: string;
  line: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
}

export const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Egeo Dolce Desodorante Colônia 90ml",
    line: "Egeo",
    price: 139.90,
    originalPrice: 169.90,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop",
    badge: "17% OFF",
  },
  {
    id: 2,
    name: "Nativa SPA Ameixa Negra Loção Hidratante 400ml",
    line: "Nativa SPA",
    price: 89.90,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=300&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Lily Eau de Parfum 75ml",
    line: "Lily",
    price: 199.90,
    originalPrice: 249.90,
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=300&h=300&fit=crop",
    badge: "20% OFF",
  },
  {
    id: 4,
    name: "Make B. Base Líquida HD 30ml",
    line: "Make B.",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Cuide-se Bem Cicatricure Creme Facial 50g",
    line: "Cuide-se Bem",
    price: 59.90,
    originalPrice: 74.90,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop",
    badge: "20% OFF",
  },
  {
    id: 6,
    name: "Malbec Desodorante Colônia 100ml",
    line: "Malbec",
    price: 159.90,
    image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=300&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Match Shampoo Nutrição Profunda 250ml",
    line: "Match",
    price: 39.90,
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Floratta Blue Desodorante Colônia 75ml",
    line: "Floratta",
    price: 119.90,
    originalPrice: 149.90,
    image: "https://images.unsplash.com/photo-1594035910387-fbc370765ad8?w=300&h=300&fit=crop",
    badge: "20% OFF",
  },
];

export const brandHighlightProducts: Product[] = [
  {
    id: 9,
    name: "Nativa SPA Quinoa Loção Firmadora 400ml",
    line: "Nativa SPA",
    price: 94.90,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=300&h=300&fit=crop",
  },
  {
    id: 10,
    name: "Lily Absolu Eau de Parfum 75ml",
    line: "Lily",
    price: 249.90,
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=300&h=300&fit=crop",
  },
  {
    id: 11,
    name: "Egeo Beat Desodorante Colônia 90ml",
    line: "Egeo",
    price: 149.90,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop",
  },
  {
    id: 12,
    name: "Malbec Gold Desodorante Colônia 100ml",
    line: "Malbec",
    price: 179.90,
    image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=300&h=300&fit=crop",
  },
];
