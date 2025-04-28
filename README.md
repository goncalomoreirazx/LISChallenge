LISChallenge
Utilizadores para teste:

1- Gestor de Projeto
Utilizador: NoahGoncalves@gmail.com
Senha: password@123

2- Programadores
Utilizador: goncalomoreira373@gmail.com
Senha: password@123

Utilizador: henriquesilva@gmail.com
Senha: password@123

Pré-requisitos

Node.js (v18 ou posterior)
Angular CLI (v19)
.NET SDK (v9.0 ou compatível)
SQL Server Express (ou qualquer instalação do SQL Server)
Git

Configuração do Backend (.NET Core)

Clone o repositório e navegue até a pasta do backend:

bashgit clone <url-do-repositório>
cd ChallengeServer

Atualize a string de conexão no appsettings.json se necessário:

json"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=IPNChallenge;Trusted_Connection=True;TrustServerCertificate=True;"
}

Compile e execute o backend:

bashdotnet build
dotnet run
A API backend deve estar rodando em http://localhost:5043.
Configuração do Frontend (Angular)

Navegue até a pasta do frontend:

bashcd Challenge

Instale as dependências:

bashnpm install

Inicie o servidor de desenvolvimento:

bashng serve
A aplicação Angular deve estar rodando em http://localhost:4200.
Teste da Aplicação

Abra o navegador e acesse http://localhost:4200
Você deverá ver a página de login
Registre um novo usuário clicando em "Sign up" (escolha o papel de Gestor de Projetos ou Programador)
Faça login com sua nova conta
Comece a usar a aplicação!

Notas

A API backend roda na porta 5043 por padrão
O servidor de desenvolvimento frontend roda na porta 4200 por padrão
Se você alterar alguma porta, certifique-se de atualizar os arquivos de ambiente no projeto Angular

Solução de Problemas
Problemas de Conexão com o Banco de Dados

Verifique sua string de conexão do SQL Server no appsettings.json
Certifique-se de que o SQL Server está rodando e acessível
Verifique se o banco de dados IPNChallenge existe

Problemas no Backend

Certifique-se de ter o .NET 9 SDK instalado
Verifique se os pacotes NuGet necessários foram restaurados

Problemas no Frontend

Verifique se o Node.js e npm estão instalados corretamente
Certifique-se de que o Angular CLI está instalado globalmente (npm install -g @angular/cli)
Verifique se a URL da API nos arquivos de ambiente aponta para a URL correta do backend




