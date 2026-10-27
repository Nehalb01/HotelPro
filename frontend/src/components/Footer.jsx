import { FaSpa } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer py-4">
      <div className="container text-center">
        <p className="mb-1 text-white fw-bold d-flex justify-content-center align-items-center gap-2">
          <FaSpa /> HotelPro
        </p>
        <small>© {new Date().getFullYear()} HotelPro. All rights reserved.</small>
      </div>
    </footer>
  );
}

export default Footer;