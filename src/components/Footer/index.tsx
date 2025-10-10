import Link from "next/link";

export function Footer({ isPublic = false }: { isPublic?: boolean }) {
  const links = [
    {
      path: "/",
      name: "Home",
      show: true,
    },
    {
      path: "/fees-policy",
      name: "Política de Taxas",
      show: !isPublic,
    },
    {
      path: "/privacy",
      name: "Política de Privacidade",
      show: true,
    },
    {
      path: "/terms",
      name: "Termos de Serviço",
      show: true,
    },
    {
      path: "/support",
      name: "Suporte",
      show: !isPublic,
    },
    {
      path: "/help/zoom",
      name: "Integração Zoom",
      show: !isPublic,
    },
  ];

  return (
    <footer
      className={`py-6 ${
        isPublic ? "bg-blue-100 text-gray-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 text-sm">
          {links.map((link) =>
            link.show ? (
              <Link
                key={link.name}
                href={link.path}
                className="hover:underline"
              >
                {link.name}
              </Link>
            ) : (
              ""
            )
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
