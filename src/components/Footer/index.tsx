import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 ">
        <div className=" flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/privacy" className="hover:underline">
            Política de Privacidade
          </Link>
          <Link href="/terms" className="hover:underline">
            Termos de Serviço
          </Link>
          <Link href="/support" className="hover:underline">
            Suporte
          </Link>
          <Link href="/help/zoom" className="hover:underline">
            Integração Zoom
          </Link>
          <a
            href="mailto:contato@scheduleasier.com"
            className="hover:underline"
          >
            Contato
          </a>
        </div>

        <p className="mt-4">
          &copy; {new Date().getFullYear()} scheduleasier. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
