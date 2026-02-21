import usePageTitle from "../hooks/usePageTitle";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const slides = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=600&fit=crop',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1920&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&h=600&fit=crop',
  'https://images.unsplash.com/photo-1549294413-26f195200c16?w=1920&h=600&fit=crop',
];

const Home = () => {
  usePageTitle("VERIDIAN HAVELI | Welcome");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // --- Admin Login State ---
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  const showSlide = (index) => {
    setCurrentSlide(index);
  };

  // --- Handle Admin Login ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    // Simple fallback check for demo purposes
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/admin');
      return;
    }

    // Try backend API integration
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminCredentials)
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdminLoggedIn', 'true');
        navigate('/admin');
      } else {
        alert('Invalid credentials. (Hint: use admin / admin123 for testing)');
      }
    } catch (err) {
      alert('Error connecting to backend. Use admin / admin123 for local testing.');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative mt-20 h-[650px] overflow-hidden">
        <div className="hero-slider relative w-full h-full">
          {slides.map((src, index) => (
            <div
              key={index}
              className={`hero-slide absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              style={{ backgroundImage: `url('${src}')` }}
            >
              <div className="absolute inset-0 bg-[#0F2A23]/50"></div>
            </div>
          ))}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center text-center z-20">
          <div className="text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display leading-tight">Welcome to <br/><span className="text-[#C2A14D]">Veridian Haveli</span></h1>
            <p className="text-lg md:text-xl mb-10 font-light tracking-wide text-white/90">Experience Luxury, Comfort & Exceptional Heritage Service</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/booking" className="btn btn-primary h-12 px-10 rounded-xl tracking-wide shadow-sm">
                Reserve Your Stay
              </Link>
              <Link to="/order" className="btn btn-secondary h-12 px-10 rounded-xl tracking-wide shadow-sm">
                In-Room Dining
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <span
              key={index}
              onClick={() => showSlide(index)}
              className={`slider-dot w-3 h-3 rounded-full cursor-pointer transition-all duration-300 border border-white/50 ${index === currentSlide ? 'bg-[#C2A14D] scale-125 border-[#C2A14D]' : 'bg-white/40 hover:bg-white/60'}`}
            ></span>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#FBF8F2] border-b border-[#E7E1D6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C2A14D] uppercase tracking-widest font-semibold text-sm mb-4">Our Heritage</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-[#0F2A23]">About Veridian Haveli</h2>
            <div className="w-20 h-1 bg-[#C2A14D] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=700&fit=crop" alt="Hotel" className="rounded-xl w-full h-[600px] object-cover border border-[#E7E1D6]" />
              <div className="absolute -bottom-8 -right-8 bg-[#0F2A23] text-white p-10 rounded-xl border border-[#C2A14D]/30 hidden md:block">
                <p className="text-5xl font-display text-[#C2A14D] mb-2">25+</p>
                <p className="text-sm tracking-widest uppercase font-light">Years of Elegance</p>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-8 font-display text-[#0F2A23]">Where Luxury Meets Comfort</h3>
              <p className="text-[#2E2E2E] mb-6 leading-relaxed text-lg font-light">
                Veridian Haveli stands as a beacon of hospitality excellence, offering world-class accommodation and services that exceed expectations. Our commitment to providing unforgettable experiences has made us a premier destination for travelers worldwide.
              </p>
              <p className="text-[#2E2E2E] mb-8 leading-relaxed text-lg font-light">
                With state-of-the-art facilities, gourmet dining options, and impeccable service, we ensure every guest enjoys a memorable stay. Veridian Haveli provides the perfect blend of luxury, comfort, and convenience.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="flex items-center space-x-4"><i className="fas fa-check-circle text-[#C2A14D] text-2xl"></i><span className="text-[#2E2E2E] font-medium">24/7 Service</span></div>
                <div className="flex items-center space-x-4"><i className="fas fa-check-circle text-[#C2A14D] text-2xl"></i><span className="text-[#2E2E2E] font-medium">Free WiFi</span></div>
                <div className="flex items-center space-x-4"><i className="fas fa-check-circle text-[#C2A14D] text-2xl"></i><span className="text-[#2E2E2E] font-medium">Luxury Spa</span></div>
                <div className="flex items-center space-x-4"><i className="fas fa-check-circle text-[#C2A14D] text-2xl"></i><span className="text-[#2E2E2E] font-medium">Swimming Pool</span></div>
              </div>
              <Link to="/booking" className="btn btn-secondary h-12 px-10 rounded-xl font-medium transition shadow-sm">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 bg-[#F4EFE7]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C2A14D] uppercase tracking-widest font-semibold text-sm mb-4">Accommodations</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-[#0F2A23]">Our Luxurious Suites</h2>
            <div className="w-20 h-1 bg-[#C2A14D] mx-auto mt-4 mb-6"></div>
            <p className="text-[#7A7A7A] max-w-2xl mx-auto text-lg font-light">Explore our collection of beautifully designed rooms and suites, each offering a unique blend of comfort and style.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            <RoomCard
              img="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop"
              title="Classic Single"
              price="2,500"
              description="An elegant space designed for comfort, perfect for the solo adventurer. Features a plush bed and modern heritage aesthetics."
            />
            <RoomCard
              img="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop"
              title="Veridian Double"
              price="4,000"
              description="Perfect for couples, offering a plush double bed, stunning views, and exquisite antique furnishings."
            />
            <RoomCard
              img="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop"
              title="Royal Family Suite"
              price="5,500"
              description="Spacious and majestic, featuring multiple beds and a separate lounging area for the whole family to unwind in style."
            />
          </div>
        </div>
      </section>
      
      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-[#FBF8F2] border-y border-[#E7E1D6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C2A14D] uppercase tracking-widest font-semibold text-sm mb-4">Amenities</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-[#0F2A23]">World-Class Facilities</h2>
            <div className="w-20 h-1 bg-[#C2A14D] mx-auto mt-4 mb-6"></div>
            <p className="text-[#7A7A7A] max-w-2xl mx-auto text-lg font-light">Discover our world-class amenities and facilities designed for your comfort and convenience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <GalleryItem img="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400&h=300&fit=crop" title="Meeting Rooms" desc="Professional conference facilities" />
            <GalleryItem img="https://5.imimg.com/data5/NK/AW/GLADMIN-33559172/marriage-hall.jpg" title="Marriage Hall" desc="Grand celebration spaces" />
            <GalleryItem img="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop" title="Garden" desc="Serene outdoor landscapes" />
            <GalleryItem img="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop" title="Parking" desc="Spacious secure parking" />
            <GalleryItem img="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop" title="EV Charging" desc="Electric vehicle charging" />
            <GalleryItem img="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop" title="Playing Areas" desc="Recreation & sports facilities" />
            <GalleryItem img="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop" title="Dining Hall" desc="Gourmet culinary experience" />
            <GalleryItem img="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop" title="Swimming Pool" desc="Luxury pool & spa" />
          </div>
        </div>
      </section>

      {/* Rajasthani Cuisine Section */}
      <section id="dining" className="py-24 bg-[#FBF8F2]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C2A14D] uppercase tracking-widest font-semibold text-sm mb-4">Fine Dining</p>
            <h2 className="text-4xl font-bold font-display text-[#0F2A23]">Rajasthani Culinary Delights</h2>
            <div className="w-20 h-1 bg-[#C2A14D] mx-auto mt-4 mb-6"></div>
            <p className="text-[#7A7A7A] max-w-2xl mx-auto text-lg font-light">Experience the authentic and rich flavors of Rajasthan, prepared by our master chefs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <GalleryItem img="https://thumbs.dreamstime.com/b/traditional-rustic-food-dal-bati-churma-indian-traditional-vegetarian-meal-dal-bati-churma-served-rajasthan-sliced-onions-219474807.jpg" title="Dal Baati Churma" desc="The classic Rajasthani signature dish." />
            <GalleryItem img="https://www.shutterstock.com/image-photo/makki-ki-roti-sarson-ka-260nw-774826042.jpg" title="Makki Ki Roti" desc="Traditional hearty flatbreads and Sarson Ka Sag." />
            <GalleryItem img="https://www.vegrecipesofindia.com/wp-content/uploads/2018/05/gatte-ki-sabji-recipe-1.jpg" title="Gatte ki Sabzi" desc="Gram flour dumplings in a tangy yogurt curry." />
            <GalleryItem img="https://www.24caratssweets.com/wp-content/uploads/2022/09/ghevar.jpg" title="Ghewar" desc="A delicious disc-shaped sweet, soaked in syrup." />
          </div>
          <div className="text-center mt-12">
            <Link to="/order" className="btn btn-secondary h-12 px-10 items-center rounded-xl font-medium transition shadow-sm">
              <i className="fas fa-utensils mr-3"></i>Order Food Online
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 bg-[#F4EFE7] border-t border-[#E7E1D6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C2A14D] uppercase tracking-widest font-semibold text-sm mb-4">Contact</p>
            <h2 className="text-4xl font-bold mb-4 font-display text-[#0F2A23]">Find Us Here</h2>
            <div className="w-20 h-1 bg-[#C2A14D] mx-auto mt-4 mb-6"></div>
            <p className="text-[#7A7A7A] text-lg font-light">Visit us at our prime heritage location</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="rounded-xl overflow-hidden border border-[#E7E1D6] shadow-sm">
              <iframe 
                title="Veridian Haveli Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.2825956587124!2d77.19013631508078!3d28.613939382422254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1d6a7a1a8b8b%3A0x2e3f0a1e6f8e0e0e!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%" 
                height="500" 
                style={{ border:0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="lux-card text-center p-10 bg-white">
                <i className="fas fa-map-marker-alt text-3xl text-[#1E5F4E] mb-6"></i>
                <h3 className="font-semibold text-[#0F2A23] text-lg mb-2">Address</h3>
                <p className="text-[#7A7A7A] text-sm font-light">Rajasthan, Sikar(Reengus), India</p>
              </div>
              <div className="lux-card text-center p-10 bg-white">
                <i className="fas fa-phone-alt text-3xl text-[#1E5F4E] mb-6"></i>
                <h3 className="font-semibold text-[#0F2A23] text-lg mb-2">Phone</h3>
                <p className="text-[#7A7A7A] text-sm font-light">+91 11 1234 5678</p>
              </div>
              <div className="lux-card text-center p-10 bg-white">
                <i className="fas fa-clock text-3xl text-[#1E5F4E] mb-6"></i>
                <h3 className="font-semibold text-[#0F2A23] text-lg mb-2">24/7 Service</h3>
                <p className="text-[#7A7A7A] text-sm font-light">Always at your service</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Hidden Admin Login Jump point */}
      <div id="admin-login" className="py-2 bg-[#FBF8F2]"></div>
    </>
  );
};

// Helper components using new Design System classes
const RoomCard = ({ img, title, price, description }) => (
  <div className="lux-card rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl flex flex-col h-full group">
    <div className="relative">
      <img src={img} alt={title} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm border border-[#C2A14D] text-[#C2A14D] text-xs font-bold px-4 py-2 rounded-full shadow-sm">
        ₹{price} / night
      </div>
    </div>
    <div className="p-8 flex flex-col flex-grow">
      <h3 className="text-2xl font-bold font-display text-[#0F2A23] mb-4">{title}</h3>
      <p className="text-[#2E2E2E] font-light text-sm mb-10 leading-relaxed flex-grow">{description}</p>
      <Link to="/booking" className="btn btn-secondary w-full tracking-wide">
        Reserve Suite
      </Link>
    </div>
  </div>
);

const GalleryItem = ({ img, title, desc }) => (
  <div className="group relative overflow-hidden rounded-xl border border-[#E7E1D6] cursor-pointer h-72">
    <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A23] via-transparent to-transparent opacity-80"></div>
    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
      <h3 className="text-xl font-display font-medium tracking-wide mb-1">{title}</h3>
      <p className="text-xs font-light text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 uppercase tracking-tighter">{desc}</p>
    </div>
  </div>
);

export default Home;