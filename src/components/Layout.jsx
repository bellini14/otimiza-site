import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

function Layout() {
  return (
    <div className="tk-elza flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 pb-0 pt-32 sm:pt-36">
        <div className="mx-auto w-full max-w-[1380px]">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
