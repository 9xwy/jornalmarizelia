import {
  sanitizeExternalUrl,
  sanitizeMultilineText,
  sanitizeSingleLineText,
} from "@/lib/security";
import {
  validateNewsArticleInput,
  validatePollInput,
  validateStudentWorkInput,
} from "@/lib/content-validation";

describe("security helpers", () => {
  it("accepts only safe http and https image urls", () => {
    expect(sanitizeExternalUrl("https://example.com/capa.jpg")).toBe("https://example.com/capa.jpg");
    expect(sanitizeExternalUrl("/imagens/capa.jpg")).toBe("/imagens/capa.jpg");
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(sanitizeExternalUrl("file:///C:/segredo.txt")).toBeNull();
  });

  it("removes control characters from text fields", () => {
    expect(sanitizeSingleLineText("  Titulo\u0000 perigoso  ", 50)).toBe("Titulo perigoso");
    expect(sanitizeMultilineText("Linha 1\r\n\r\nLinha\u0007 2", 50)).toBe("Linha 1\n\nLinha 2");
  });
});

describe("content validation", () => {
  it("rejects unsafe image urls in news posts", () => {
    expect(() =>
      validateNewsArticleInput({
        slug: "titulo-seguro",
        title: "Titulo seguro",
        category: "Evento",
        summary: "Resumo suficientemente grande",
        content: "Conteudo suficientemente grande para passar na validacao.",
        author: "Equipe",
        coverImageUrl: "javascript:alert(1)",
        coverTone: "from-primary/60 to-primary/25",
        featured: false,
        status: "published",
        publishedAt: "2026-04-18T13:00",
      }),
    ).toThrow("http/https");
  });

  it("rejects invalid poll payloads with too few options", () => {
    expect(() =>
      validatePollInput({
        question: "Qual atividade voce prefere para o proximo sabado?",
        description: "Escolha uma opcao.",
        isActive: true,
        closesAt: "",
        options: [{ label: "  ", votes: 0 }],
      }),
    ).toThrow();
  });

  it("normalizes safe work content without allowing unsafe image urls", () => {
    expect(() =>
      validateStudentWorkInput({
        slug: "poesia-da-turma",
        title: "Poesia da turma",
        workType: "Poesia",
        author: "Turma 7A",
        excerpt: "Um resumo curto e valido",
        content: "Verso 1\n\nVerso 2 com conteudo suficiente para a validacao.",
        coverImageUrl: "data:image/svg+xml,<svg></svg>",
        coverTone: "from-primary/60 to-primary/25",
        featured: false,
        status: "published",
        publishedAt: "2026-04-18T13:00",
      }),
    ).toThrow("http/https");
  });
});
