import brand from '../config/brand'

export default function Footer() {
  return (
    <footer className="footer">
      <small>Developed by {brand.author}</small>
    </footer>
  )
}
