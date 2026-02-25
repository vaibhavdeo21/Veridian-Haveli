import usePageTitle from "../hooks/usePageTitle";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const slides = [
  'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1920&h=900&fit=crop', // Royal courtyard haveli
  'https://media.istockphoto.com/id/1217681157/photo/hallways-in-the-taj-mahal-mosque-agra-india.jpg?s=612x612&w=0&k=20&c=4FRM0iJAdnm0Gagwn7KC8o58eggf6WqA2eeYLMAhlNQ=', // Palace arches corridor
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&h=900&fit=crop', // Heritage palace exterior
  'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?w=1920&h=900&fit=crop', // Indoor palace room
  'https://www.korea.net/upload/content/editImage/20201221134128973_XI8FWU96.jpg', // Evening lantern palace
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&h=900&fit=crop', // Night heritage lighting
];

const Home = () => {
  usePageTitle("VERIDIAN HAVELI | Heritage Sanctuary");
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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/admin');
      return;
    }
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
        alert('Invalid credentials.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display leading-tight">
                Where Royal Heritage Meets <br/>
                <span className="text-[#C2A14D]">Modern Serenity</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 font-light tracking-wide text-white/90">
                Not just a stay — a pause from the noise of the world. <br/>
                Wake up to silence, courtyards, and curated luxury.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/booking" className="btn btn-primary h-12 px-10 rounded-xl tracking-widest uppercase text-[10px] font-bold shadow-md">
                Explore Rooms
              </Link>
              <Link to="/order" className="btn btn-secondary h-12 px-10 rounded-xl tracking-widest uppercase text-[10px] font-bold shadow-md">
                View Experiences
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <span
              key={index}
              onClick={() => showSlide(index)}
              className={`slider-dot w-2 h-2 rounded-full cursor-pointer transition-all duration-300 border border-white/50 ${index === currentSlide ? 'bg-[#C2A14D] scale-125 border-[#C2A14D]' : 'bg-white/40 hover:bg-white/60'}`}
            ></span>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#FBF8F2] border-b border-[#E7E1D6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#C2A14D] uppercase tracking-[0.4em] font-bold text-[10px] mb-4">Our Heritage</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-[#0F2A23]">A Home Built on Stories</h2>
            <div className="w-16 h-1 bg-[#C2A14D] mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&h=700&fit=crop" alt="Heritage Courtyard" className="rounded-xl w-full h-[600px] object-cover border border-[#E7E1D6] shadow-sm" />
              <div className="absolute -bottom-8 -right-8 bg-[#0F2A23] text-white p-10 rounded-xl border border-[#C2A14D]/30 hidden md:block shadow-2xl">
                <p className="text-5xl font-display text-[#C2A14D] mb-2">25+</p>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-white/60">Years of Elegance</p>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-8 font-display text-[#0F2A23]">A sanctuary of calm, crafted in stone, tradition, and timeless hospitality.</h3>
              <p className="text-[#2E2E2E] mb-6 leading-relaxed text-lg font-light">
                Veridian Haveli was envisioned as a retreat — not a hotel. Inspired by traditional Rajasthani courtyards, every wall, arch, and corridor is designed to slow time. Here, mornings begin with soft light through jharokhas and evenings end under warm lanterns.
              </p>
              <p className="text-[#2E2E2E] mb-10 leading-relaxed text-lg font-light">
                We believe luxury is not marble and chandeliers — it is space, silence, and attention. Whether you arrive for rest, celebration, or escape, the haveli adapts to your rhythm.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="flex items-center space-x-4"><i className="fas fa-hand-holding-heart text-[#C2A14D] text-lg opacity-70"></i><span className="text-[11px] font-black uppercase tracking-widest text-[#0F2A23]">Personal Host Assistance</span></div>
                <div className="flex items-center space-x-4"><i className="fas fa-wifi text-[#C2A14D] text-lg opacity-70"></i><span className="text-[11px] font-black uppercase tracking-widest text-[#0F2A23]">Seamless Connectivity</span></div>
                <div className="flex items-center space-x-4"><i className="fas fa-spa text-[#C2A14D] text-lg opacity-70"></i><span className="text-[11px] font-black uppercase tracking-widest text-[#0F2A23]">Wellness Rituals</span></div>
                <div className="flex items-center space-x-4"><i className="fas fa-swimmer text-[#C2A14D] text-lg opacity-70"></i><span className="text-[11px] font-black uppercase tracking-widest text-[#0F2A23]">Courtyard Pool</span></div>
              </div>
              <Link to="/booking" className="btn btn-secondary h-12 px-10 rounded-xl uppercase tracking-widest text-[10px] font-bold shadow-md">
                Enter the Retreat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 bg-[#F4EFE7]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#C2A14D] uppercase tracking-[0.4em] font-bold text-[10px] mb-4">Accommodations</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-[#0F2A23]">Residences & Chambers</h2>
            <div className="w-16 h-1 bg-[#C2A14D] mx-auto mt-6 mb-8"></div>
            <p className="text-[#7A7A7A] max-w-2xl mx-auto text-lg font-light">Each room is designed as a private residence — not a numbered unit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            <RoomCard
              img="https://www.oberoihotels.com/-/media/oberoi-hotel/udaivilas-resized/Udaivilas/Accommodation/luxury_suite_with_private_pool/desktop820x646/luxury_suite5.jpg"
              title="Courtyard Room"
              price="25,000"
              description="Overlooking the inner courtyard, designed for peaceful solitary stays with refined heritage aesthetics."
            />
            <RoomCard
              img="https://images-luxe.outlookindia.com/2025/04/28175341/hotel_luxe_main_20250428.jpg"
              title="Heritage Chamber"
              price="40,000"
              description="Stone textures, handcrafted furniture, and warm evening lighting for the ultimate experience in slow living."
            />
            <RoomCard
              img="https://www.indianexcursions.co/wp-content/uploads/2019/05/samode-haveli-lounge.jpg"
              title="Haveli Suite"
              price="55,000"
              description="A spacious private wing featuring majestic jharokhas and separate lounging areas ideal for families."
            />
          </div>
        </div>
      </section>
      
      {/* Amenities Section */}
      <section id="gallery" className="py-24 bg-[#FBF8F2] border-y border-[#E7E1D6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#C2A14D] uppercase tracking-[0.4em] font-bold text-[10px] mb-4">Amenities</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-[#0F2A23]">Spaces to Experience</h2>
            <div className="w-16 h-1 bg-[#C2A14D] mx-auto mt-6 mb-8"></div>
            <p className="text-[#7A7A7A] max-w-2xl mx-auto text-lg font-light">Interiors and outdoor landscapes designed for comfort, connection, and calm.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <GalleryItem img="https://www.cvent.com/venues/_next/image?url=https%3A%2F%2Fimages.cvent.com%2FCSN%2F322037d7-5fbe-40a6-92a2-5f1f8028d009%2Fimages%2Fea75e055a3ef43af9007addcfee53be7_LARGE!_!9ceab7c0556ec1c87025de48cb3c8ee7.jpg&w=3840&q=75" title="Private Gatherings" desc="Professional conference facilities" />
            <GalleryItem img="https://htoindia.com/wp-content/uploads/2025/08/Luxury-hotels.jpg" title="Celebration Courtyard" desc="Grand celebration spaces" />
            <GalleryItem img="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/46/28/b9/peacock-lounge.jpg?w=900&h=500&s=1" title="Morning Garden Walks" desc="Serene outdoor landscapes" />
            <GalleryItem img="https://c8.alamy.com/comp/KJ5H2A/lobby-and-guest-reception-area-in-the-five-star-taj-palace-hotel-delhi-KJ5H2A.jpg" title="Guest Arrival Court" desc="Spacious secure parking" />
            <GalleryItem img="https://www.energetica-india.net/images/noticias/52M927cwTouARK8FWCNo3QGzquCbtKTmAgk3cBnvqXv8hsC4uQhlhoa.jpg" title="Sustainable Travel" desc="Electric vehicle charging support" />
            <GalleryItem img="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202504/noor-mahal--known-for-weddings--is-now-a-leisure-travel-favourite-on-long-weekends-091825717-16x9_0.jpg?VersionId=B8VWbKzoFWOiMVUc5ostF4ZK55yf0AQ8&size=690:388" title="Leisure Corners" desc="Recreation & sports facilities" />
            <GalleryItem img="https://cdn.sanity.io/images/ocl5w36p/prod5/08074e733af0f111dc3b41190ddc989fdc9157e1-1726x960.jpg?w=480&auto=format&dpr=2" title="Heritage Dining Room" desc="Gourmet culinary experience" />
            <GalleryItem img="https://www.luxewellnessclub.com/wp-content/uploads/2024/01/Hotel-Review-Six-Senses-Fort-Barwara-Luxe-Wellness-Club-19.jpg" title="Stone Courtyard Pool" desc="Luxury pool & spa rituals" />
          </div>
        </div>
      </section>

      {/* Rajasthani Cuisine Section */}
      <section id="dining" className="py-24 bg-[#FBF8F2]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#C2A14D] uppercase tracking-[0.4em] font-bold text-[10px] mb-4">Fine Dining</p>
            <h2 className="text-4xl font-bold font-display text-[#0F2A23]">Dining at Veridian</h2>
            <div className="w-16 h-1 bg-[#C2A14D] mx-auto mt-6 mb-8"></div>
            <p className="text-[#7A7A7A] max-w-2xl mx-auto text-lg font-light">Meals here are prepared slowly, served warmly, and meant to be remembered.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <GalleryItem img="https://www.foodiaq.com/wp-content/uploads/2025/05/lal-maas.jpg" title="Laal Maas" desc="Royal Rajput hunting curry (signature luxury dish)." />
            <GalleryItem img="https://www.whiskaffair.com/wp-content/uploads/2020/09/Ker-Sangri-2-2.jpg" title="Ker Sangri" desc="Desert beans & berries (very heritage, very Rajasthan)." />
            <GalleryItem img="https://sunayanagupta.com/recipeimages/528X703/Bajre-ki-roti.jpg" title="Bajre ki Roti" desc="Desert staple (heritage feel)." />
            <GalleryItem img="https://i0.wp.com/foodtrails25.com/wp-content/uploads/2019/03/img_3245_ezy-watermark_10-03-2019_10-42-05pm.jpg?fit=250%2C219&ssl=1" title="Mawa Kachori" desc="Famous Jodhpur luxury sweet." />
          </div>
          <div className="text-center mt-16">
            <Link to="/order" className="btn btn-secondary h-12 px-12 items-center rounded-xl uppercase tracking-widest text-[10px] font-bold shadow-md">
              <i className="fas fa-utensils mr-3"></i>View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 bg-[#F4EFE7] border-t border-[#E7E1D6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#C2A14D] uppercase tracking-[0.4em] font-bold text-[10px] mb-4">Contact</p>
            <h2 className="text-4xl font-bold mb-4 font-display text-[#0F2A23]">Your Journey Ends Here</h2>
            <div className="w-16 h-1 bg-[#C2A14D] mx-auto mt-6 mb-8"></div>
            <p className="text-[#7A7A7A] text-lg font-light italic">Just far enough from the city to breathe.</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="rounded-xl overflow-hidden border border-[#E7E1D6] shadow-md">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="lux-card text-center p-12 bg-white">
                <i className="fas fa-map-marker-alt text-2xl text-[#1E5F4E] mb-6 opacity-60"></i>
                <h3 className="font-bold text-[#0F2A23] text-sm uppercase tracking-widest mb-3">Address</h3>
                <p className="text-[#7A7A7A] text-sm font-light">Rajasthan, Sikar(Reengus), India</p>
              </div>
              <div className="lux-card text-center p-12 bg-white">
                <i className="fas fa-phone-alt text-2xl text-[#1E5F4E] mb-6 opacity-60"></i>
                <h3 className="font-bold text-[#0F2A23] text-sm uppercase tracking-widest mb-3">Phone</h3>
                <p className="text-[#7A7A7A] text-sm font-light">+91 11 1234 5678</p>
              </div>
              <div className="lux-card text-center p-12 bg-white">
                <i className="fas fa-concierge-bell text-2xl text-[#1E5F4E] mb-6 opacity-60"></i>
                <h3 className="font-bold text-[#0F2A23] text-sm uppercase tracking-widest mb-3">Concierge</h3>
                <p className="text-[#7A7A7A] text-sm font-light">Always at your service</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div id="admin-login" className="py-2 bg-[#FBF8F2]"></div>
    </>
  );
};

// Helper components using new Design System classes
const RoomCard = ({ img, title, price, description }) => (
  <div className="lux-card rounded-xl overflow-hidden transition-all duration-700 hover:shadow-2xl flex flex-col h-full group bg-white border-haveli-border">
    <div className="relative overflow-hidden">
      <img src={img} alt={title} className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm border border-[#C2A14D] text-[#C2A14D] text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-sm">
        ₹{price} / night
      </div>
    </div>
    <div className="p-10 flex flex-col flex-grow">
      <h3 className="text-2xl font-bold font-display text-[#0F2A23] mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-[#2E2E2E] font-light text-sm mb-10 leading-relaxed flex-grow italic">{description}</p>
      <Link to="/booking" className="btn btn-secondary w-full uppercase tracking-[0.2em] text-[10px] font-bold shadow-sm">
        Check Availability
      </Link>
    </div>
  </div>
);

const GalleryItem = ({ img, title, desc }) => (
  <div className="group relative overflow-hidden rounded-xl border border-[#E7E1D6] cursor-pointer h-72 shadow-sm bg-white">
    <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A23] via-[#0F2A23]/20 to-transparent opacity-90"></div>
    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
      <h3 className="text-xl font-display font-medium tracking-wide mb-2">{title}</h3>
      <p className="text-[9px] font-black text-[#C2A14D] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 uppercase tracking-[0.2em]">{desc}</p>
    </div>
  </div>
);

export default Home;