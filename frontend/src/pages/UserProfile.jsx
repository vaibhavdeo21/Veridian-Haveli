import React, { useMemo, useEffect } from 'react'; // FIX: Added missing useMemo and useEffect imports
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { Link } from 'react-router-dom';

// src/pages/UserProfile.jsx

const UserProfile = () => {
    const { user } = useAuth();
    const { customers } = useData();

    // FIX: Match by email (vaibhavpdeo0028@gmail.com) instead of username
    const myBookings = useMemo(() => {
        if (!customers || !user) return [];

        return customers.filter(c => {
            // 1. Try matching by email (Best way)
            const matchEmail = c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase();

            // 2. Try matching by Name (Fallback)
            const matchName = c.guestName && user.username && c.guestName.toLowerCase().includes(user.username.toLowerCase());

            return matchEmail || matchName;
        });
    }, [customers, user]);

    return (
        <main className="pt-32 pb-16 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Profile Header */}
                <div className="flex items-center space-x-6 mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                        <p className="text-gray-500 text-lg">Logged in as <span className="font-semibold text-amber-700">{user?.username}</span></p>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">My Booked Rooms</h2>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {myBookings.length} Active Stays
                        </span>
                    </div>

                    <div className="p-8">
                        {myBookings.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-bed text-3xl text-gray-300"></i>
                                </div>
                                <p className="text-gray-500 text-lg mb-6">You haven't booked any rooms yet.</p>
                                <Link to="/booking" className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md hover:shadow-lg">
                                    Book a Room Now
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {myBookings.map((booking) => (
                                    <div key={booking._id || booking.id} className="group border border-gray-200 rounded-xl p-6 hover:border-amber-500 hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    {/* SYNC FIX: Display the room category if available, otherwise fallback */}
                                                    <h3 className="text-xl font-bold text-gray-800">{booking.roomType || 'Hotel Room'}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'CheckedIn' || booking.status === 'Checked In' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'CheckedOut' || booking.status === 'Checked Out' ? 'bg-gray-100 text-gray-600' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {booking.status || 'Booked'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <span><i className="far fa-calendar-alt mr-2 text-amber-600"></i>
                                                        {new Date(booking.checkInDate).toLocaleDateString()} to {new Date(booking.checkOutDate).toLocaleDateString()}
                                                    </span>
                                                    <span><i className="fas fa-door-open mr-2 text-amber-600"></i>Room:
                                                        {/* SYNC FIX: Use roomNumber to match MongoDB */}
                                                        <span className="font-bold text-gray-900 ml-1">{booking.roomNumber || booking.roomNo}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 md:mt-0 text-right">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Total Bill</p>
                                                {/* SYNC FIX: Database uses totalAmount */}
                                                <p className="text-2xl font-black text-amber-700">₹{(booking.totalAmount || booking.totalBill || 0).toLocaleString()}</p>
                                                {(booking.status === 'CheckedIn' || booking.status === 'Checked In') && (
                                                    <Link to="/order" className="mt-3 inline-flex items-center text-sm font-bold text-green-600 hover:text-green-700">
                                                        Order Room Service <i className="fas fa-chevron-right ml-2"></i>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

// CRITICAL: This is the line your error is looking for!
export default UserProfile;