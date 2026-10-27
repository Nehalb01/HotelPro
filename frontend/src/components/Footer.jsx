function Footer() {
  return (
    <footer className="footer py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-1 text-white fw-bold">HotelPro</p>
        <small>© {new Date().getFullYear()} HotelPro. All rights reserved.</small>
      </div>
    </footer>
  );
}

export default Footer;