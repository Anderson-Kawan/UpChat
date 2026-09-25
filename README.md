# Upchat

## Deploy na Vercel

O projeto continua sendo executado localmente com ASP.NET Core, mas a Vercel
publica a versão estática presente em `wwwroot`.

Quando alterar uma view, inicie a aplicação e atualize o HTML estático:

```bash
dotnet run --urls http://127.0.0.1:5080
./scripts/export-static.sh
```

Depois, envie `wwwroot/index.html` junto com as demais alterações. Na Vercel,
importe o repositório normalmente; o arquivo `vercel.json` define `wwwroot`
como diretório de saída e dispensa um comando de build.

Site em ASP.NET Core MVC (.NET 10).

## Executar

```sh
dotnet run --launch-profile http
```

Acesse `http://localhost:5229`.

## Cabeçalho e rodapé compartilhados

- `Views/Shared/Header.cshtml`: estrutura e links do cabeçalho.
- `wwwroot/css/header.css`: estilos e responsividade do cabeçalho.
- `Views/Shared/Footer.cshtml`: estrutura do rodapé.
- `wwwroot/css/footer.css`: estilos e responsividade do rodapé.
- `wwwroot/css/site.css`: paleta, fontes, botões, marca e estilos compartilhados, além das seções da home.
- `wwwroot/js/site.js`: comportamento do menu mobile e do cabeçalho ao rolar.

O arquivo `Views/Shared/_Layout.cshtml` carrega os estilos uma única vez e inclui os componentes ao redor do conteúdo da página:

```cshtml
<partial name="Header" />
<main role="main">
    @RenderBody()
</main>
<partial name="Footer" />
```

## Criar uma nova página

Todas as views dentro de `Views` herdam esse layout por meio de `Views/_ViewStart.cshtml`. Crie a action no controller e sua view normalmente, escrevendo apenas o conteúdo da página:

```cshtml
@{
    ViewData["Title"] = "Minha página";
}

<section class="section">
    <div class="container">
        <h1>Minha página</h1>
        <p>Conteúdo da página.</p>
    </div>
</section>
```

O cabeçalho e o rodapé aparecem automaticamente; não repita as chamadas dos componentes na view. Views que definirem outro `Layout` ou `Layout = null` deixam de usar esse padrão.

Os links do cabeçalho apontam para a página inicial com fragmentos, inclusive quando acessados de outra página. Atualmente, apenas a seção `clientes` existe na home; os demais destinos (`solucoes`, `plataforma`, `integracoes`, `sobre`, `sac`, `entrar` e `contato`) ainda precisam ser implementados ou substituídos pelas URLs definitivas.
