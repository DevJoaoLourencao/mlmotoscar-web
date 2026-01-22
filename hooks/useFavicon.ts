import { useEffect, useRef } from "react";

export const useFavicon = (faviconUrl?: string) => {
  const previousUrl = useRef<string | undefined>();

  useEffect(() => {
    // Evitar atualizações desnecessárias
    if (!faviconUrl || faviconUrl === previousUrl.current) return;

    previousUrl.current = faviconUrl;

    // Atualizar todos os links de favicon
    const links = document.querySelectorAll("link[rel*='icon']");

    links.forEach((link) => {
      (link as HTMLLinkElement).href = faviconUrl;
    });

    // Se não existir nenhum link de favicon, criar um
    if (links.length === 0) {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.type = "image/png";
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);
    }
  }, [faviconUrl]);
};
