import Link from "next/link"
import Header from "../components/Header"

import "./home.css";

export default () => {
  return (<>
    <Header />
    <main className="hero-container">
      <div className="hero-content">
        <span className="badge">Новий рівень чатів 🚀</span>

        <h1 className="title">
          Спілкуйся без меж разом із <span className="highlight">Akira</span>
        </h1>

        <p className="description">
          Сучасний месенджер, створений для швидкого, зручного та безпечного
          спілкування з друзями. Без зайвого мусору — тільки ти, твої люди та чистий кайф від користування.
        </p>

        <div className="actions">
          <Link href="/registration" className="btn btn-primary">
            Створити акаунт
          </Link>
          <Link href="/login" className="btn btn-secondary">
            У мене вже є акаунт
          </Link>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>⚡ Повна швидкість</h3>
            <p>Ніяких затримок. Повідомлення долітають миттєво.</p>
          </div>
          <div className="feature-card">
            <h3>🎨 Твоя тема</h3>
            <p>Перемикайся між світлою та темною темою за 1 секунду.</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Безпека</h3>
            <p>Надійний захист даних та повна приватність переписок.</p>
          </div>
        </div>
      </div>
    </main>
  </>)
}