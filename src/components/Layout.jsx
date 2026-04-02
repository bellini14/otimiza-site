import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-10 pt-32 sm:pt-36">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
