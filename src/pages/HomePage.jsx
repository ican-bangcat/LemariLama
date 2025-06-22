import React, { useState } from "react";
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
    },
    {
      id: 2,
      name: "Skinny Fit Jeans",
      price: 240,
      originalPrice: 260,
      rating: 3,
      reviews: 3.5,
      discount: 20,
    },
    { id: 3, name: "Checkered Shirt", price: 180, rating: 4, reviews: 4.5 },
    {
      id: 4,
      name: "Sleeve Striped T-shirt",
      price: 130,
      originalPrice: 160,
      rating: 4,
      reviews: 4.5,
      discount: 30,
    },
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
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-black transform rotate-45 hidden lg:block"></div>
        <div className="absolute bottom-20 right-40 w-12 h-12 bg-black transform rotate-45 hidden lg:block"></div>
        <div className="absolute top-40 left-1/2 w-6 h-6 bg-black transform rotate-45 hidden lg:block"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
                FIND CLOTHES
                <br />
                THAT MATCHES
                <br />
                YOUR STYLE
              </h1>
              <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                Browse through our diverse range of meticulously crafted
                garments, designed to bring out your individuality and cater to
                your sense of style.
              </p>
              <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors shadow-lg">
                Shop Now
              </button>

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
            {/* <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-400 rounded-xl flex items-center justify-center shadow-2xl">
                <span className="text-gray-600 text-xl font-medium">Hero Fashion Image</span>
              </div>
            </div> */}
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
            {["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"].map(
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="border-2 border-gray-300 text-white px-8 py-3 rounded-full hover:bg-gray-50 transition-colors font-medium">
              View All
            </button>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Top Selling */}
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
            <button className="border-2 border-gray-300 text-white px-8 py-3 rounded-full hover:bg-gray-50 transition-colors font-medium">
              View All
            </button>
          </div>
        </div>
      </section>

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
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-gray-700">
                Formal
              </h3>
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-gray-700">
                Party
              </h3>
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-1 bg-white rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-gray-700">
                Gym
              </h3>
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
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
                className="p-2 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={20} color="white"/>
              </button>
              <button
                onClick={nextTestimonial}
                className="p-2 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <ArrowRight size={20} color="white"/>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white border-2 rounded-xl p-6 transition-all ${
                  index === currentTestimonial
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
                {["Twitter", "Facebook", "Instagram", "GitHub"].map(
                  (social, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <span className="text-white text-xs font-bold">
                        {social[0]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-black">COMPANY</h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Career
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-black">HELP</h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Customer Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Delivery Details
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-black">RESOURCES</h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Free eBooks
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Development Tutorial
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    How to - Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Youtube Playlist
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">
                Shop.co © 2000-2023, All Rights Reserved
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {[
                  "Visa",
                  "Mastercard",
                  "PayPal",
                  "Apple Pay",
                  "Google Pay",
                ].map((payment) => (
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
