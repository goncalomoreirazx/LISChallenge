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

Guia de Configuração do Projeto Challenge
Este guia irá ajudá-lo a configurar os componentes frontend (Angular) e backend (.NET Core) do projeto Challenge na sua máquina local.

Pré-requisitos
Node.js (v18 ou superior)
Angular CLI (v19)
.NET SDK (v9.0 ou compatível)
SQL Server Express (ou qualquer instalação do SQL Server)
Git
Configuração do Backend (.NET Core)
1- Clone o repositório e navegue para a pasta do backend:

Bash

git clone <url-do-repositorio>
cd ChallengeServer
2- Atualize a string de conexão no ficheiro appsettings.json, se necessário:

JSON

"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=IPNChallenge;Trusted_Connection=True;TrustServerCertificate=True;"
}
3- Compile e execute o backend:

Bash

dotnet build
dotnet run
A API do backend deverá estar agora a correr em http://localhost:5043.

Configuração do Frontend (Angular)
1- Navegue para a pasta do frontend:

Bash

cd Challenge
2- Instale as dependências:

Bash

npm install
3- Inicie o servidor de desenvolvimento:

Bash

ng serve
Testar a Aplicação
1- Abra o seu navegador e navegue para http://localhost:4200.
2- Deverá ver a página de login.
3- Registe um novo utilizador clicando em "Sign up" (escolha o papel de Gestor de Projeto ou Programador).
4- Faça login com a sua nova conta.
5- Comece a usar a aplicação!

Notas
A API do backend corre na porta 5043 por defeito.
O servidor de desenvolvimento do frontend corre na porta 4200 por defeito.
Se alterar alguma porta, certifique-se de atualizar os ficheiros de ambiente (environment) no projeto Angular.
Resolução de Problemas
Problemas de Ligação à Base de Dados
Verifique a sua string de conexão do SQL Server no appsettings.json.
Certifique-se de que o SQL Server está em execução e acessível.
Verifique se a base de dados IPNChallenge existe.
Problemas no Backend
Certifique-se de que tem o .NET 9 SDK instalado.
Verifique se os pacotes NuGet necessários foram restaurados (dotnet restore).
Problemas no Frontend
Verifique se o Node.js e o npm estão corretamente instalados.
Certifique-se de que o Angular CLI está instalado globalmente (npm install -g @angular/cli).
Verifique se o URL da API nos ficheiros de ambiente (environment) aponta para o URL correto do backend (http://localhost:5043 por defeito).




