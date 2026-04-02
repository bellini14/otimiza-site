function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-4 text-sm text-slate-600">
        <p>© {new Date().getFullYear()} Site Otimiza. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
