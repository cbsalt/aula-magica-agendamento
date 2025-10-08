import Link from "next/link";

export default function Footer({ isPublic }: { isPublic?: boolean }) {
  return (
    <footer
      className={`py-6 ${
        isPublic ? "bg-blue-100 text-gray-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {!isPublic && (
            <Link href="/fees-policy" className="hover:underline">
              Política de Taxas
            </Link>
          )}
          <Link href="/privacy" className="hover:underline">
            Política de Privacidade
          </Link>
          <Link href="/terms" className="hover:underline">
            Termos de Serviço
          </Link>

          {!isPublic && (
            <>
              <Link href="/support" className="hover:underline">
                Suporte
              </Link>
              <Link href="/help/zoom" className="hover:underline">
                Integração Zoom
              </Link>
            </>
          )}

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
