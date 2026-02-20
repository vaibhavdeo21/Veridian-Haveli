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
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // --- Admin Login State ---
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
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
      <section id="home" className="relative mt-20 h-[600px] overflow-hidden">
        <div className="hero-slider relative w-full h-full">
          {slides.map((src, index) => (
            <div
              key={index}
              className={`hero-slide absolute inset-0 bg-cover bg-center ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url('${src}')` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          ))}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="text-white px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 font-display">Welcome to Jhankar Hotel</h1>
            <p className="text-xl md:text-2xl mb-8">Experience Luxury, Comfort & Exceptional Service</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold transition inline-block shadow-2xl">
                Book Your Stay
              </Link>
              <Link to="/order" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition inline-block shadow-2xl">
                Order Delicious Food
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <span
              key={index}
              onClick={() => showSlide(index)}
              className={`slider-dot w-3 h-3 rounded-full bg-white opacity-50 cursor-pointer ${index === currentSlide ? 'active' : ''}`}
            ></span>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-display text-amber-800">About Jhankar Hotel</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=700&fit=crop" alt="Hotel" className="rounded-2xl shadow-2xl w-full h-[500px] object-cover" />
              <div className="absolute -bottom-6 -right-6 bg-amber-600 text-white p-6 rounded-xl shadow-xl">
                <p className="text-4xl font-bold">25+</p>
                <p className="text-sm">Years of Excellence</p>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4 font-display">Where Luxury Meets Comfort</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Jhankar Hotel stands as a beacon of hospitality excellence, offering world-class accommodation and services that exceed expectations. Our commitment to providing unforgettable experiences has made us a premier destination for travelers worldwide.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                With state-of-the-art facilities, gourmet dining options, and impeccable service, we ensure every guest enjoys a memorable stay. Whether you're here for business or pleasure, Aryan Hotel provides the perfect blend of luxury, comfort, and convenience.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3"><i className="fas fa-check-circle text-amber-600 text-xl"></i><span className="text-gray-700">24/7 Service</span></div>
                <div className="flex items-center space-x-3"><i className="fas fa-check-circle text-amber-600 text-xl"></i><span className="text-gray-700">Free WiFi</span></div>
                <div className="flex items-center space-x-3"><i className="fas fa-check-circle text-amber-600 text-xl"></i><span className="text-gray-700">Luxury Spa</span></div>
                <div className="flex items-center space-x-3"><i className="fas fa-check-circle text-amber-600 text-xl"></i><span className="text-gray-700">Swimming Pool</span></div>
              </div>
              <Link to="/booking" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-display text-amber-800">Our Luxurious Rooms</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore our collection of beautifully designed rooms and suites, each offering a unique blend of comfort and style.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Room Cards */}
            <RoomCard
              img="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop"
              title="Standard Single"
              price="2,500"
              description="A cozy and elegant space designed for comfort, perfect for the solo adventurer. Features a plush single bed and modern amenities."
            />
            <RoomCard
              img="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop"
              title="Deluxe Double"
              price="4,000"
              description="Perfect for couples or solo travelers, offering a plush double bed and stunning city views. Enjoy extra space and comfort."
            />
            <RoomCard
              img="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop"
              title="Family Suite"
              price="5,500"
              description="Spacious and luxurious, featuring multiple beds (1 double, 1 single) and a separate living area for the whole family."
            />
          </div>
        </div>
      </section>
      
      {/* Gallery Section */}
      <section id="gallery" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-display text-amber-800">Our Facilities</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our world-class amenities and facilities designed for your comfort and convenience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <section id="dining" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-display text-amber-800">Rajasthani Culinary Delights</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience the authentic and rich flavors of Rajasthan, prepared by our master chefs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GalleryItem img="https://thumbs.dreamstime.com/b/traditional-rustic-food-dal-bati-churma-indian-traditional-vegetarian-meal-dal-bati-churma-served-rajasthan-sliced-onions-219474807.jpg" title="Dal Baati Churma" desc="The classic Rajasthani signature dish." />
            <GalleryItem img="https://www.shutterstock.com/image-photo/makki-ki-roti-sarson-ka-260nw-774826042.jpg" title="Makki Ki Roti Sarson Ka Sag" desc="Fiery and flavorful traditional meat curry." />
            <GalleryItem img="https://www.vegrecipesofindia.com/wp-content/uploads/2018/05/gatte-ki-sabji-recipe-1.jpg" title="Gatte ki Sabzi" desc="Gram flour dumplings in a tangy yogurt curry." />
            <GalleryItem img="https://www.24caratssweets.com/wp-content/uploads/2022/09/ghevar.jpg" title="Ghewar" desc="A delicious disc-shaped sweet, soaked in syrup." />
          </div>
          <div className="text-center mt-12">
            <Link to="/order" className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition shadow-lg">
              <i className="fas fa-utensils mr-2"></i>Order Food Online
            </Link>
          </div>
        </div>
      </section>

      {/* Google Maps Location */}
      <section id="location" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-display text-amber-800">Find Us Here</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Visit us at our prime location</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <iframe 
                title="Jhankar Hotel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.2825956587124!2d77.19013631508078!3d28.613939382422254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1d6a7a1a8b8b%3A0x2e3f0a1e6f8e0e0e!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%" 
                height="500" 
                style={{ border:0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-amber-50 rounded-xl">
                <i className="fas fa-map-marker-alt text-3xl text-amber-600 mb-3"></i>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-gray-600 text-sm">Rajasthan,Sikar(Reengus), India</p>
              </div>
              <div className="text-center p-6 bg-amber-50 rounded-xl">
                <i className="fas fa-phone text-3xl text-amber-600 mb-3"></i>
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-gray-600 text-sm">+91 11 1234 5678</p>
              </div>
              <div className="text-center p-6 bg-amber-50 rounded-xl">
                <i className="fas fa-clock text-3xl text-amber-600 mb-3"></i>
                <h3 className="font-semibold mb-2">24/7 Service</h3>
                <p className="text-gray-600 text-sm">Always at your service</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </>
  );
};

// Helper components for Home page
const RoomCard = ({ img, title, price, description }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
    <div className="relative">
      <img src={img} alt={title} className="w-full h-64 object-cover" />
      <div className="absolute top-4 right-4 bg-amber-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
        ₹{price} / night
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-2xl font-bold font-display text-amber-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link to="/booking" className="inline-block bg-amber-100 text-amber-800 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 hover:text-white transition-all duration-300 w-full text-center">
        Book Now
      </Link>
    </div>
  </div>
);

const GalleryItem = ({ img, title, desc }) => (
  <div className="gallery-item group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition">
    <img src={img} alt={title} className="w-full h-64 object-cover group-hover:scale-110 transition duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm">{desc}</p>
    </div>
  </div>
);

export default Home;