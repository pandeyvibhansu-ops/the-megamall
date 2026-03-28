import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  ChevronDown,
  Instagram,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend";
import {
  useAddProduct,
  useCheckAdminPassword,
  useDeleteProduct,
  useProducts,
} from "./hooks/useQueries";

type CartMap = Record<string, number>;

const WHATSAPP_NUMBER = "918303379462";
const INSTAGRAM_URL = "https://www.instagram.com/vibhansu_pandit";
const CART_STORAGE_KEY = "megamall_cart";

const CATEGORIES = [
  {
    name: "Clothing",
    img: "/assets/generated/category-clothing.dim_400x300.jpg",
    emoji: "👗",
  },
  {
    name: "Appliances",
    img: "/assets/generated/category-appliances.dim_400x300.jpg",
    emoji: "🔌",
  },
  {
    name: "Gifting",
    img: "/assets/generated/category-gifting.dim_400x300.jpg",
    emoji: "🎁",
  },
  {
    name: "Food",
    img: "/assets/generated/category-food.dim_400x300.jpg",
    emoji: "🍱",
  },
];

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function isPlaceholder(url: string): boolean {
  return !url || url.includes("placeholder") || url.includes("via.placeholder");
}

function productImageUrl(product: Product): string {
  if (isPlaceholder(product.imageUrl)) {
    const colors = ["8B0F14", "1a6b3c", "1a3c6b", "6b3c1a", "3c1a6b", "6b1a3c"];
    const colorIdx = Number(product.id) % colors.length;
    const enc = encodeURIComponent(product.name.substring(0, 12));
    return `https://via.placeholder.com/300x300/${colors[colorIdx]}/ffffff?text=${enc}`;
  }
  return product.imageUrl;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= rating
              ? "text-brand-star fill-current"
              : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({rating}.0)</span>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  const rating = ((Number(product.id) % 2) + 4) as number;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border group"
    >
      <div className="relative overflow-hidden bg-muted h-52">
        <img
          src={productImageUrl(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/300x300/8B0F14/ffffff?text=${encodeURIComponent(product.name.substring(0, 12))}`;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-card-foreground line-clamp-2 mb-1 leading-snug">
          {product.name}
        </h3>
        <StarRating rating={rating} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-brand-red">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            data-ocid="product.add_button"
            onClick={() => onAddToCart(product)}
            className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-charcoal text-xs font-bold px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const SKELETON_KEYS = [
  "sk-a",
  "sk-b",
  "sk-c",
  "sk-d",
  "sk-e",
  "sk-f",
  "sk-g",
  "sk-h",
];

export default function App() {
  const { data: products = [], isLoading } = useProducts();
  const addProductMutation = useAddProduct();
  const deleteProductMutation = useDeleteProduct();
  const checkPasswordMutation = useCheckAdminPassword();

  const [cart, setCart] = useState<CartMap>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Admin state
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImage, setNewProductImage] = useState("");

  const productsRef = useRef<HTMLDivElement>(null);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({
      product: products.find((p) => p.id.toString() === id),
      qty,
      id,
    }))
    .filter((item) => item.product !== undefined) as {
    product: Product;
    qty: number;
    id: string;
  }[];

  const cartTotal = cartItems.reduce(
    (s, item) => s + Number(item.product.price) * item.qty,
    0,
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function addToCart(product: Product) {
    const key = product.id.toString();
    setCart((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    toast.success(`${product.name} added to cart!`);
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const newQty = (next[id] ?? 0) + delta;
      if (newQty <= 0) delete next[id];
      else next[id] = newQty;
      return next;
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleCheckoutWhatsApp() {
    if (cartItems.length === 0) return;
    const lines = cartItems
      .map(
        (i) =>
          `${i.product.name} x${i.qty} = ${formatPrice(BigInt(Number(i.product.price) * i.qty))}`,
      )
      .join(", ");
    const msg = `I want to order from The Megamall. Total: ₹${cartTotal.toLocaleString("en-IN")}. Items: ${lines}`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
    setCart({});
    setCartOpen(false);
    toast.success("Redirecting to WhatsApp…");
  }

  async function handleAdminLogin() {
    if (!adminPassword) return;
    try {
      const ok = await checkPasswordMutation.mutateAsync(adminPassword);
      if (ok) {
        setAdminLoginOpen(false);
        setAdminPanelOpen(true);
        setAdminPassword("");
        toast.success("Welcome, Admin!");
      } else {
        toast.error("Incorrect password");
      }
    } catch {
      toast.error("Login failed");
    }
  }

  async function handleAddProduct() {
    if (!newProductName || !newProductPrice) {
      toast.error("Please fill name and price");
      return;
    }
    const priceNum = Number.parseInt(newProductPrice);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await addProductMutation.mutateAsync({
        name: newProductName,
        price: BigInt(priceNum),
        imageUrl: newProductImage || "",
      });
      setNewProductName("");
      setNewProductPrice("");
      setNewProductImage("");
      toast.success("Product added!");
    } catch {
      toast.error("Failed to add product");
    }
  }

  async function handleDeleteProduct(id: bigint) {
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50">
        {/* Top bar */}
        <div className="bg-brand-red px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 mr-4 shrink-0">
              <span className="text-2xl">🛍️</span>
              <span
                className="text-white font-black text-lg sm:text-xl tracking-widest"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                THE MEGAMALL
              </span>
            </a>

            {/* Search bar */}
            <div className="flex flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-l-full border-0 outline-none text-foreground"
                data-ocid="header.search_input"
              />
              <button
                type="button"
                className="bg-brand-yellow hover:bg-brand-yellow-dark px-5 py-2 rounded-r-full text-brand-charcoal font-bold text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 ml-auto shrink-0">
              <button
                type="button"
                className="text-white/80 hover:text-white p-2"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                type="button"
                data-ocid="header.cart_button"
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-charcoal font-bold px-4 py-2 rounded-full text-sm transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-brand-red text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Nav bar */}
        <nav className="bg-brand-yellow px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto">
            <button
              type="button"
              className="flex items-center gap-1.5 bg-brand-red text-white px-4 py-1.5 rounded font-semibold text-sm whitespace-nowrap shrink-0"
            >
              <span>☰</span> Categories <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {[
              "Men",
              "Women",
              "Kids",
              "Electronics",
              "Home",
              "Festive Sale 🔥",
            ].map((cat) => (
              <a
                key={cat}
                href="#products"
                className="text-sm font-semibold text-brand-charcoal hover:text-brand-red transition-colors whitespace-nowrap"
                data-ocid="nav.link"
              >
                {cat}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ===== HERO BANNER ===== */}
        <section className="relative bg-brand-red overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center px-6 py-12 lg:py-20 gap-8">
            <div className="flex-1 text-white z-10">
              <p className="text-brand-yellow font-bold text-sm tracking-widest uppercase mb-2">
                🎊 Limited Time Offer
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                CELEBRATE
                <br />
                THE SEASON!
              </h1>
              <p className="text-5xl sm:text-6xl font-black text-brand-yellow mb-2">
                Upto 50% OFF
              </p>
              <p className="text-xl font-semibold text-white/80 mb-8">
                Festive Collection
              </p>
              <button
                type="button"
                data-ocid="hero.primary_button"
                onClick={() =>
                  productsRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-charcoal font-black px-8 py-3.5 rounded-full text-base tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                SHOP NOW →
              </button>
            </div>

            {/* Hero image in yellow semicircle */}
            <div className="flex-shrink-0 relative">
              <div
                className="w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-brand-yellow overflow-hidden flex items-end justify-center"
                style={{ clipPath: "ellipse(100% 100% at 50% 100%)" }}
              >
                <img
                  src="/assets/generated/hero-banner.dim_600x500.jpg"
                  alt="Festive Collection"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 40"
              className="w-full"
              fill="white"
              aria-hidden="true"
            >
              <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
            </svg>
          </div>
        </section>

        {/* ===== POPULAR CATEGORIES ===== */}
        <section className="bg-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-2xl font-black text-brand-charcoal mb-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              POPULAR CATEGORIES
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Shop your favourite categories
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.name}
                  whileHover={{ scale: 1.03 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group h-40"
                  data-ocid="category.card"
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-lg">{cat.emoji}</span>
                    <p className="font-bold text-sm">{cat.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRODUCT GRID ===== */}
        <section
          id="products"
          ref={productsRef}
          className="bg-background py-12 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-2xl font-black text-brand-charcoal"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : "TRENDING PRODUCTS"}
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {filteredProducts.length} products
                </p>
              </div>
            </div>

            {isLoading ? (
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                data-ocid="products.loading_state"
              >
                {SKELETON_KEYS.map((sk) => (
                  <div key={sk} className="bg-card rounded-2xl overflow-hidden">
                    <Skeleton className="h-52 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                className="text-center py-20 text-muted-foreground"
                data-ocid="products.empty_state"
              >
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-lg font-semibold">
                  {searchQuery
                    ? "No products match your search"
                    : "No products available"}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-brand-red underline text-sm"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                data-ocid="products.list"
              >
                {filteredProducts.map((product, idx) => (
                  <div
                    key={product.id.toString()}
                    data-ocid={`products.item.${idx + 1}`}
                  >
                    <ProductCard product={product} onAddToCart={addToCart} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-brand-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3
              className="font-black text-lg mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              🛍️ THE MEGAMALL
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              India's favourite online shopping destination. Quality products,
              unbeatable prices, and lightning-fast delivery to your doorstep.
            </p>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-brand-yellow mb-3">
              Payment Methods
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-white/60">
              {[
                "💳 Credit Card",
                "💳 Debit Card",
                "📱 UPI",
                "🏦 Net Banking",
                "💰 Cash on Delivery",
              ].map((m) => (
                <span key={m} className="bg-white/10 px-2 py-1 rounded text-xs">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Social & Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-brand-yellow mb-3">
              Connect With Us
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                data-ocid="footer.link"
              >
                <Instagram className="w-4 h-4 text-brand-pink" /> Instagram
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                data-ocid="footer.link"
              >
                <MessageCircle className="w-4 h-4 text-brand-green" /> WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setAdminLoginOpen(true)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mt-1"
                data-ocid="admin.open_modal_button"
              >
                <User className="w-4 h-4" /> Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* Copyright strip */}
        <div className="bg-brand-red-dark px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
            <span>
              © {new Date().getFullYear()} The Megamall. All rights reserved.
            </span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING SOCIAL BUTTONS ===== */}
      <div className="fixed bottom-6 right-5 flex flex-col gap-3 z-40">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          title="Instagram"
          data-ocid="social.link"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          title="WhatsApp"
          data-ocid="social.link"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>

      {/* ===== CART DRAWER ===== */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
              data-ocid="cart.modal"
            >
              {/* Cart header */}
              <div className="bg-brand-red text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-bold text-lg">Your Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-brand-yellow text-brand-charcoal text-xs font-black px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="text-white/80 hover:text-white p-1"
                  data-ocid="cart.close_button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div
                    className="text-center py-16 text-muted-foreground"
                    data-ocid="cart.empty_state"
                  >
                    <p className="text-4xl mb-3">🛒</p>
                    <p className="font-semibold">Your cart is empty</p>
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className="mt-3 bg-brand-red text-white text-sm px-6 py-2 rounded-full font-semibold"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map(({ product, qty, id }, idx) => (
                    <div
                      key={id}
                      className="flex gap-3 p-3 bg-muted rounded-xl"
                      data-ocid={`cart.item.${idx + 1}`}
                    >
                      <img
                        src={productImageUrl(product)}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/64x64/8B0F14/ffffff?text=P";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-brand-red font-bold text-sm">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQty(id, -1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted-foreground/10 transition-colors"
                            data-ocid={`cart.toggle.${idx + 1}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-sm w-5 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(id, 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted-foreground/10 transition-colors"
                            data-ocid={`cart.toggle.${idx + 1}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="ml-auto font-semibold text-sm">
                            {formatPrice(BigInt(Number(product.price) * qty))}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 self-start"
                        data-ocid={`cart.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-border p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="text-xl font-black text-brand-red">
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckoutWhatsApp}
                    className="w-full bg-brand-green text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-opacity shadow-lg"
                    data-ocid="cart.primary_button"
                  >
                    <MessageCircle className="w-4 h-4" />
                    CHECKOUT WITH WHATSAPP
                  </button>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="w-full bg-brand-red text-white font-bold py-3 rounded-full text-sm hover:bg-brand-red-dark transition-colors"
                    data-ocid="cart.secondary_button"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== ADMIN LOGIN DIALOG ===== */}
      <Dialog open={adminLoginOpen} onOpenChange={setAdminLoginOpen}>
        <DialogContent className="max-w-sm" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🔐</span> Admin Login
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="admin-password"
                className="text-sm font-medium text-muted-foreground block mb-1.5"
              >
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                data-ocid="admin.input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAdminLoginOpen(false)}
                data-ocid="admin.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white"
                onClick={handleAdminLogin}
                disabled={checkPasswordMutation.isPending}
                data-ocid="admin.submit_button"
              >
                {checkPasswordMutation.isPending ? "Checking…" : "Login"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ADMIN PANEL DIALOG ===== */}
      <Dialog open={adminPanelOpen} onOpenChange={setAdminPanelOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="admin.panel"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>⚙️</span> Admin Panel
            </DialogTitle>
          </DialogHeader>

          {/* Add product form */}
          <div className="bg-muted rounded-xl p-4 space-y-3 mb-4">
            <h3 className="font-bold text-sm text-brand-red uppercase tracking-wide">
              Add New Product
            </h3>
            <Input
              placeholder="Product name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              data-ocid="admin.product.input"
            />
            <Input
              placeholder="Price (₹)"
              type="number"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              data-ocid="admin.price.input"
            />
            <Input
              placeholder="Image URL (optional)"
              value={newProductImage}
              onChange={(e) => setNewProductImage(e.target.value)}
              data-ocid="admin.image.input"
            />
            <Button
              type="button"
              onClick={handleAddProduct}
              disabled={addProductMutation.isPending}
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white"
              data-ocid="admin.product.submit_button"
            >
              {addProductMutation.isPending ? "Adding…" : "+ Add Product"}
            </Button>
          </div>

          {/* Product list */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-brand-charcoal uppercase tracking-wide">
              Products ({products.length})
            </h3>
            {products.length === 0 ? (
              <p
                className="text-muted-foreground text-sm text-center py-4"
                data-ocid="admin.products.empty_state"
              >
                No products yet
              </p>
            ) : (
              products.map((p, idx) => (
                <div
                  key={p.id.toString()}
                  className="flex items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border"
                  data-ocid={`admin.product.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={productImageUrl(p)}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/40x40/8B0F14/ffffff?text=P";
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      <p className="text-brand-red text-xs font-bold">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProduct(p.id)}
                    disabled={deleteProductMutation.isPending}
                    data-ocid={`admin.product.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
