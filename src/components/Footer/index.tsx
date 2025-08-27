import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} scheduleasier. Todos os direitos
          reservados.
        </p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/privacy" className="hover:underline">
            Política de Privacidade
          </Link>
          <Link href="/terms" className="hover:underline">
            Termos de Serviço
          </Link>
          <a
            href="mailto:contato@scheduleasier.com"
            className="hover:underline"
          >
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}
