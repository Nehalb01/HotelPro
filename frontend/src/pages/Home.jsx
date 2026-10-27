import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaConciergeBell, FaWifi, FaShieldAlt, FaHeadset } from "react-icons/fa";
import api from "../services/api";

const features = [
  { icon: <FaConciergeBell />, title: "Easy Booking", text: "Pick your dates and book a room in under a minute." },
  { icon: <FaWifi />, title: "Modern Amenities", text: "Comfortable rooms with everything you need for your stay." },
  { icon: <FaShieldAlt />, title: "No Double Bookings", text: "Live availability so your dates are always safe." },
  { icon: <FaHeadset />, title: "Friendly Support", text: "Our team is ready to help before and during your stay." },
];

function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/rooms");
        const list = res.data.rooms || res.data;
        setRooms(list.slice(0, 3));
      } catch (err) {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <section className="hero text-center">
        <div className="container">
          <h1>Your Perfect Stay Starts Here</h1>
          <p className="mb-4">
            Browse comfortable rooms, check live availability and book instantly with HotelPro.
          </p>
          <Link to="/rooms" className="btn btn-light btn-lg me-2">
            Browse Rooms
          </Link>
          <Link to="/register" className="btn btn-outline-light btn-lg">
            Create Account
          </Link>
        </div>
      </section>

      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Featured Rooms</h2>
          <Link to="/rooms">View all rooms</Link>
        </div>

        {loading && <p>Loading rooms...</p>}
        {!loading && rooms.length === 0 && <p>No rooms available yet. Check back soon.</p>}

        <div className="row">
          {rooms.map((room) => (
            <div className="col-md-4 mb-4" key={room._id}>
              <div className="card h-100 shadow-sm">
                {room.image ? (
                  <img
                    src={room.image}
                    alt={room.name || room.roomNumber}
                    className="card-img-top"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                ) : (
                  <div className="room-placeholder">Room {room.roomNumber}</div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{room.name || `Room ${room.roomNumber}`}</h5>
                  <p className="text-muted mb-1">{room.type}</p>
                  <p className="fw-bold">₹{room.price} / night</p>
                  <Link to={`/book/${room._id}`} className="btn btn-primary w-100">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-5">
        <div className="container">
          <h2 className="text-center mb-5">Why Choose HotelPro</h2>
          <div className="row text-center">
            {features.map((f) => (
              <div className="col-md-3 col-sm-6 mb-4" key={f.title}>
                <div className="feature-icon mb-3">{f.icon}</div>
                <h5>{f.title}</h5>
                <p className="text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;