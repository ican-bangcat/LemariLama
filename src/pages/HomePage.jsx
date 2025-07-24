import React, { useState } from "react";
import { Link } from "react-router-dom"; // Ditambahkan
import { Star, ArrowLeft, ArrowRight } from "lucide-react";




// ProductCard Component
const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-gray-500 text-sm font-medium">
            {product.name}
          </span>
        </div>
        {product.discount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-medium">
            -{product.discount}%
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < product.rating ? "currentColor" : "none"}
                className="text-yellow-400"
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {product.reviews}/5
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-black">${product.price}</span>
          {product.originalPrice && (
            <>
              <span className="text-gray-500 line-through text-sm">
                ${product.originalPrice}
              </span>
              {product.discount && (
                <span className="text-red-500 text-sm font-medium">
                  -{product.discount}%
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// HomePage Component
const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const newArrivals = [
    {
      id: 1,
      name: "T-shirt with Tape Details",
      price: 120,
      rating: 4,
      reviews: 4.5,
      image: "https://down-id.img.susercontent.com/file/id-11134207-7r98x-lz35v9cjwdoled"
    },
    {
      id: 2,
      name: "Skinny Fit Jeans",
      price: 240,
      rating: 3,
      reviews: 3.5,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg745618l01PL2GxguX9-i4Qmkc1eXpmqx6w&s"
    },
    {
      id: 3,
      name: "Checkered Shirt",
      price: 180,
      rating: 4,
      reviews: 4.5,
      image: "data:image/jpeg;base64,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"
    },
    {
      id: 4,
      name: "Sleeve Striped T-shirt",
      price: 130,
      rating: 4,
      reviews: 4.5,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR0TLIUE-lc6p6AUMwN7TMBE09ltNXjRlThw&s"
    },
    {
      id: 5,
      name: "Oversized Hoodie",
      price: 190,
      rating: 5,
      reviews: 5.0,
      image: "https://images-cdn.ubuy.co.in/665e92b30bf0e87f042814ca-oversized-hoodie-men-vintage-cotton.jpg"
    },
    {
      id: 6,
      name: "Casual Summer Shorts",
      price: 95,
      rating: 3,
      reviews: 3.0,
      image: "https://images.lee.com/is/image/Lee/112369071-HERO?$KDP-LARGE2$"
    },
    {
      id: 7,
      name: "Puma Sepatu",
      price: 95,
      rating: 3,
      reviews: 3.0,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhXpxa97O9524B7I0ljN98RjeQqk7qMfXe2A&s"
    },
    {
      id: 8,
      name: "Sepatu Nike",
      price: 95,
      rating: 3,
      reviews: 3.0,
      image: "https://img.ncrsport.com/img/storage/large/DJ6106-002-1.jpg"
    }
  ];

  const topSelling = [
    {
      id: 1,
      name: "Vertical Striped Shirt",
      price: 212,
      originalPrice: 232,
      rating: 5,
      reviews: 5.0,
      discount: 20,
    },
    {
      id: 2,
      name: "Courage Graphic T-shirt",
      price: 145,
      rating: 4,
      reviews: 4.0,
    },
    {
      id: 3,
      name: "Loose Fit Bermuda Shorts",
      price: 80,
      rating: 3,
      reviews: 3.0,
    },
    { id: 4, name: "Faded Skinny Jeans", price: 210, rating: 4, reviews: 4.5 },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
    },
    {
      name: "Alex K.",
      rating: 5,
      text: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    },
    {
      name: "James L.",
      rating: 5,
      text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute top-20 right-20 w-16 h-16 bg-black transform rotate-45 hidden lg:block"></div>
        <div className="absolute bottom-20 right-40 w-12 h-12 bg-black transform rotate-45 hidden lg:block"></div>
        <div className="absolute top-40 left-1/2 w-6 h-6 bg-black transform rotate-45 hidden lg:block"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
                DISCOVER PRELOVED FINDS
                <br />
                THAT DEFINE YOUR STYLE
              </h1>
              <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                Jelajahi koleksi pilihan pakaian dan barang bekas berkualitas di LemariLama.
                Temukan gaya unikmu dengan produk preloved yang tetap keren, terjangkau,
                dan ramah lingkungan.
              </p>


              <Link to="/products">
                <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors shadow-lg">
                  Shop Now
                </button>
              </Link>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 text-center lg:text-left">
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-black">
                    200+
                  </div>
                  <div className="text-gray-600 text-sm">
                    International Brands
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-black">
                    2,000+
                  </div>
                  <div className="text-gray-600 text-sm">
                    High-Quality Products
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-black">
                    30,000+
                  </div>
                  <div className="text-gray-600 text-sm">Happy Customers</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img
                src="/images/hero-fashion.png"
                alt="Fashion Hero"
                className="w-full aspect-square object-contain rounded-xl "
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="bg-black py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-16">
            {["PUMA", "NB", "GUCCI", "PRADA", "Calvin Klein"].map(
              (brand) => (
                <div
                  key={brand}
                  className="text-white text-lg sm:text-xl lg:text-2xl font-bold opacity-80 hover:opacity-100 transition-opacity"
                >
                  {brand}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-center mb-12 text-black">
            NEW ARRIVALS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-medium">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < product.rating ? "fill-current" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.958c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.958a1 1 0 00-.364-1.118L2.07 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">{product.reviews}/5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-black">${product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-gray-500 line-through text-sm">
                          ${product.originalPrice}
                        </span>
                        {product.discount && (
                          <span className="text-red-500 text-sm font-medium">
                            -{product.discount}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="border-2 border-gray-300 text-black px-8 py-3 rounded-full hover:bg-gray-100 transition-colors font-medium">
              View All
            </button>
          </div>
        </div>
      </section>


      <div className="border-t border-gray-200"></div>

      {/* Top Selling
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-center mb-12 text-black">
            TOP SELLING
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topSelling.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="border-2 border-gray-300 text-black px-8 py-3 rounded-full hover:bg-gray-100 transition-colors font-medium">
              View All
            </button>
          </div>
        </div>
      </section> */}

      {/* Browse by Style */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-center mb-12 text-black">
            BROWSE BY DRESS STYLE
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-gray-700">
                Casual
              </h3>
              <img
                src="https://i.pinimg.com/736x/5d/cb/94/5dcb940aa83580fce1cbcaed93060f4a.jpg"
                alt="Casual"
                className="rounded-lg h-32 w-full object-cover"
              />
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-gray-700">
                Formal
              </h3>
              <img
                src="https://tse2.mm.bing.net/th/id/OIP.U-0YX1j77MUaeivkVbnkZQHaD4?pid=Api&P=0&h=180"
                alt="Formal"
                className="rounded-lg h-32 w-full object-cover"
              />
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-gray-700">
                Party
              </h3>
              <img
                src="https://tse4.mm.bing.net/th/id/OIP.qe7qmuJnyf7UiGGVVNgXQQHaHa?pid=Api&P=0&h=180"
                alt="Party"
                className="rounded-lg h-32 w-full object-cover"
              />
            </div>
            <div className="lg:col-span-1 bg-white rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-gray-700">
                Gym
              </h3>
              <img
                src="https://tse1.mm.bing.net/th/id/OIP.4FeaFJXf_UugJDtdGzHRngHaHa?pid=Api&P=0&h=180"
                alt="Gym"
                className="rounded-lg h-32 w-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-black mb-4 sm:mb-0">
              OUR HAPPY CUSTOMERS
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={prevTestimonial}
                className="p-2 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-black" />
              </button>
              <button
                onClick={nextTestimonial}
                className="p-2 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowRight size={20} className="text-black" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white border-2 rounded-xl p-6 transition-all ${index === currentTestimonial
                  ? "border-black shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                      className="text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="font-semibold text-black">
                    {testimonial.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 lg:py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            STAY UP TO DATE ABOUT
            <br />
            OUR LATEST OFFERS
          </h2>
          <div className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <button className="w-full bg-white text-black px-6 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4 text-black">SHOP.CO</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We have clothes that suits your style and which you're proud to
                wear. From women to men.
              </p>
              <div className="flex space-x-4">
                {["T", "F", "I", "G"].map(
                  (social, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <span className="text-white text-xl font-bold">
                        {social}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-black">COMPANY</h4>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">About</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Works</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Career</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-black">HELP</h4>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Customer Support</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Delivery Details</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-black">RESOURCES</h4>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Free eBooks</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Development Tutorial</a></li>
                <li><a href="#" className="hover:text-black transition-colors">How to - Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Youtube Playlist</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">
                LemariLama © 2025, All Rights Reserved
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"].map((payment) => (
                  <div
                    key={payment}
                    className="w-12 h-8 bg-white border border-gray-300 rounded flex items-center justify-center"
                  >
                    <span className="text-xs text-gray-600 font-medium">
                      {payment.slice(0, 4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
