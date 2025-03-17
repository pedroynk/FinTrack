export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-10 sm:py-12 lg:px-8">
        {/* <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {["Sobre", "Trabalho", "Serviços", "Contato"].map((item) => (
            <div key={item} className="pb-6">
              <Link
                to={`/${item.toLowerCase()}`}
                className="text-sm leading-6 text-muted-foreground hover:text-foreground"
              >
                {item}
              </Link>
            </div>
          ))}
        </nav> */}
        <p className="mb-10 text-center text-sm leading-5 text-muted-foreground">
          🌟 Não é porque as coisas são difíceis que não ousamos, é porque não ousamos que elas são difíceis.
        </p>
      </div>
    </footer>
  );
}
