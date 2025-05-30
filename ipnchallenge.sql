USE [master]
GO
/****** Object:  Database [IPNChallenge]    Script Date: 28/04/2025 09:31:05 ******/
CREATE DATABASE [IPNChallenge]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'IPNChallenge', FILENAME = N'E:\Freelance\SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\IPNChallenge.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'IPNChallenge_log', FILENAME = N'E:\Freelance\SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\IPNChallenge_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [IPNChallenge] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [IPNChallenge].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [IPNChallenge] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [IPNChallenge] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [IPNChallenge] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [IPNChallenge] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [IPNChallenge] SET ARITHABORT OFF 
GO
ALTER DATABASE [IPNChallenge] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [IPNChallenge] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [IPNChallenge] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [IPNChallenge] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [IPNChallenge] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [IPNChallenge] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [IPNChallenge] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [IPNChallenge] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [IPNChallenge] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [IPNChallenge] SET  DISABLE_BROKER 
GO
ALTER DATABASE [IPNChallenge] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [IPNChallenge] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [IPNChallenge] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [IPNChallenge] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [IPNChallenge] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [IPNChallenge] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [IPNChallenge] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [IPNChallenge] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [IPNChallenge] SET  MULTI_USER 
GO
ALTER DATABASE [IPNChallenge] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [IPNChallenge] SET DB_CHAINING OFF 
GO
ALTER DATABASE [IPNChallenge] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [IPNChallenge] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [IPNChallenge] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [IPNChallenge] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [IPNChallenge] SET QUERY_STORE = ON
GO
ALTER DATABASE [IPNChallenge] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [IPNChallenge]
GO
/****** Object:  Table [dbo].[Projectos]    Script Date: 28/04/2025 09:31:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Projectos](
	[ID_Projecto] [int] IDENTITY(1,1) NOT NULL,
	[Nome] [varchar](150) NOT NULL,
	[Descricao] [varchar](max) NULL,
	[Orcamento] [decimal](18, 2) NULL,
	[DataCriacao] [datetime] NOT NULL,
	[ID_Gestor] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_Projecto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProjectosProgramadores]    Script Date: 28/04/2025 09:31:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProjectosProgramadores](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[ID_Projecto] [int] NOT NULL,
	[ID_Programador] [int] NOT NULL,
	[DataAtribuicao] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tarefas]    Script Date: 28/04/2025 09:31:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tarefas](
	[ID_Tarefa] [int] IDENTITY(1,1) NOT NULL,
	[Nome] [varchar](200) NOT NULL,
	[Descricao] [varchar](max) NULL,
	[DataCriacao] [datetime] NOT NULL,
	[DataLimite] [datetime] NOT NULL,
	[Estado] [varchar](50) NOT NULL,
	[DataConclusao] [datetime] NULL,
	[ID_Projecto] [int] NOT NULL,
	[ID_Responsavel] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_Tarefa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TimeTracking]    Script Date: 28/04/2025 09:31:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TimeTracking](
	[ID_TimeEntry] [int] IDENTITY(1,1) NOT NULL,
	[ID_Tarefa] [int] NOT NULL,
	[ID_Utilizador] [int] NOT NULL,
	[Data] [date] NOT NULL,
	[Horas] [decimal](5, 2) NOT NULL,
	[Observacoes] [nvarchar](max) NULL,
	[DataRegisto] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_TimeEntry] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TiposUtilizador]    Script Date: 28/04/2025 09:31:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TiposUtilizador](
	[ID_TipoUtilizador] [int] IDENTITY(1,1) NOT NULL,
	[Nome] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_TipoUtilizador] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Utilizadores]    Script Date: 28/04/2025 09:31:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Utilizadores](
	[ID_Utilizador] [int] IDENTITY(1,1) NOT NULL,
	[Nome] [varchar](100) NOT NULL,
	[Email] [varchar](255) NOT NULL,
	[PasswordHash] [varchar](max) NOT NULL,
	[ID_TipoUtilizador] [int] NOT NULL,
	[DataCriacao] [datetime] NOT NULL,
	[DataUltimoLogin] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID_Utilizador] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Projectos] ON 

INSERT [dbo].[Projectos] ([ID_Projecto], [Nome], [Descricao], [Orcamento], [DataCriacao], [ID_Gestor]) VALUES (3, N'IPNChallenge', N'Este exercício tem como propósito de aplicar as competências adquiridas pelo estagiário num contexto concreto e avaliar como ele analisa o problema e como o resolve. Deve ter em consideração que estamos interessados em analisar como o estagiário organiza o código, aplica bons princípios de teste e padrões de design, e utiliza ferramentas de suporte ao desenvolvimento.

DESAFIO:

Pretende-se com este exercício que seja desenvolvida uma plataforma web que permita a gestão de projectos e de tarefas associadas aos mesmos, bem como atribuir as tarefas a uma determinada pessoa.

Os utilizadores da plataforma podem ser de um de dois tipos: 1) gestor de projecto ou 2) programador. Deve ser possível a um utilizador fazer o seu registo na plataforma (escolhendo qual o tipo de utilizador), bem como fazer login e logout.

Os gestores de projecto devem ter a capacidade de gerir projectos e tarefas (criar, listar, ver detalhes, editar e apagar).

Os programadores devem ter a capacidade de listar as tarefas que lhes estão associadas, bem como de marcá-las como terminadas.

Um projecto tem que possuir um nome, um gestor associado e um orçamento, podendo ter outras características que achar relevante.

Uma tarefa tem que possuir um nome, um responsável (um programador), uma data limite para ser terminada, um estado, e um projecto a que está associada, podendo ter outras características que achar relevante.

Deve ser feito uso de uma base de dados local para armazenamento dos dados tratados através da plataforma baseada em SQL Server, e a plataforma deve ser acedida e utilizada através de um browser. O estagiário tem liberdade para decidir como implementar detalhes e/ou como resolver situações que não estejam contemplados no enunciado.

SUBMISSÃO:

Para submissão da resolução do exercício deve ser fornecido um link para um repositório de código (por exemplo, no Github) e devem ser fornecidas instruções de como colocar a plataforma em execução.

A plataforma deve vir já populada com um conjunto de dados de exemplo, que permita a sua utilização, tais como:

• 1 gestor de projecto;

• 2 programadores;

• 2 projectos, com tarefas criadas em cada um e associadas a programadores.

Deve também submeter uma lista das ferramentas utilizadas para o desenvolvimento, com uma descrição sucinta (máximo de uma linha) da finalidade da utilização de cada ferramenta.', CAST(1040.00 AS Decimal(18, 2)), CAST(N'2025-04-27T16:00:14.200' AS DateTime), 2)
SET IDENTITY_INSERT [dbo].[Projectos] OFF
GO
SET IDENTITY_INSERT [dbo].[ProjectosProgramadores] ON 

INSERT [dbo].[ProjectosProgramadores] ([ID], [ID_Projecto], [ID_Programador], [DataAtribuicao]) VALUES (4, 3, 1, CAST(N'2025-04-27T16:00:21.623' AS DateTime))
INSERT [dbo].[ProjectosProgramadores] ([ID], [ID_Projecto], [ID_Programador], [DataAtribuicao]) VALUES (5, 3, 3, CAST(N'2025-04-27T16:00:21.623' AS DateTime))
SET IDENTITY_INSERT [dbo].[ProjectosProgramadores] OFF
GO
SET IDENTITY_INSERT [dbo].[Tarefas] ON 

INSERT [dbo].[Tarefas] ([ID_Tarefa], [Nome], [Descricao], [DataCriacao], [DataLimite], [Estado], [DataConclusao], [ID_Projecto], [ID_Responsavel]) VALUES (6, N'Frontend', N'Dashboard', CAST(N'2025-04-27T16:00:41.260' AS DateTime), CAST(N'2025-05-04T00:00:00.000' AS DateTime), N'Pendente', NULL, 3, 1)
INSERT [dbo].[Tarefas] ([ID_Tarefa], [Nome], [Descricao], [DataCriacao], [DataLimite], [Estado], [DataConclusao], [ID_Projecto], [ID_Responsavel]) VALUES (7, N'Backend', N'RestAPIs', CAST(N'2025-04-27T16:00:59.760' AS DateTime), CAST(N'2025-05-04T00:00:00.000' AS DateTime), N'Pendente', NULL, 3, 3)
SET IDENTITY_INSERT [dbo].[Tarefas] OFF
GO
SET IDENTITY_INSERT [dbo].[TiposUtilizador] ON 

INSERT [dbo].[TiposUtilizador] ([ID_TipoUtilizador], [Nome]) VALUES (2, N'Programmer')
INSERT [dbo].[TiposUtilizador] ([ID_TipoUtilizador], [Nome]) VALUES (1, N'Project Manager')
SET IDENTITY_INSERT [dbo].[TiposUtilizador] OFF
GO
SET IDENTITY_INSERT [dbo].[Utilizadores] ON 

INSERT [dbo].[Utilizadores] ([ID_Utilizador], [Nome], [Email], [PasswordHash], [ID_TipoUtilizador], [DataCriacao], [DataUltimoLogin]) VALUES (1, N'Goncalo Moreira', N'goncalomoreira373@gmail.com', N'$2a$11$OhQNX/ePXk2kZHWifQ72OuOMBJePgIYgPmGSYURxcFDctj/yD6/6K', 2, CAST(N'2025-04-24T09:01:10.437' AS DateTime), CAST(N'2025-04-28T08:20:42.927' AS DateTime))
INSERT [dbo].[Utilizadores] ([ID_Utilizador], [Nome], [Email], [PasswordHash], [ID_TipoUtilizador], [DataCriacao], [DataUltimoLogin]) VALUES (2, N'Noah Goncalves', N'NoahGoncalves@gmail.com', N'$2a$11$C3wMaXDZpLjwYmXwBOrllu3YWCk7K3n7tuR1z4nYTJb1aC0Clbo7S', 1, CAST(N'2025-04-24T09:01:38.130' AS DateTime), CAST(N'2025-04-27T15:52:47.620' AS DateTime))
INSERT [dbo].[Utilizadores] ([ID_Utilizador], [Nome], [Email], [PasswordHash], [ID_TipoUtilizador], [DataCriacao], [DataUltimoLogin]) VALUES (3, N'Henrique Silva', N'henriquesilva@gmail.com', N'$2a$11$DWs7xDJgdAxl26L42mX.0uD/NopPiMorSLbEz3cJhMWP6XFh/sNb6', 2, CAST(N'2025-04-24T09:05:22.707' AS DateTime), CAST(N'2025-04-24T09:05:30.243' AS DateTime))
SET IDENTITY_INSERT [dbo].[Utilizadores] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TiposUti__7D8FE3B26529923D]    Script Date: 28/04/2025 09:31:06 ******/
ALTER TABLE [dbo].[TiposUtilizador] ADD UNIQUE NONCLUSTERED 
(
	[Nome] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Utilizad__A9D1053417475A51]    Script Date: 28/04/2025 09:31:06 ******/
ALTER TABLE [dbo].[Utilizadores] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Projectos] ADD  CONSTRAINT [DF_Projectos_DataCriacao]  DEFAULT (getdate()) FOR [DataCriacao]
GO
ALTER TABLE [dbo].[ProjectosProgramadores] ADD  CONSTRAINT [DF_ProjectosProgramadores_DataAtribuicao]  DEFAULT (getdate()) FOR [DataAtribuicao]
GO
ALTER TABLE [dbo].[Tarefas] ADD  CONSTRAINT [DF_Tarefas_DataCriacao]  DEFAULT (getdate()) FOR [DataCriacao]
GO
ALTER TABLE [dbo].[Tarefas] ADD  CONSTRAINT [DF_Tarefas_Estado]  DEFAULT ('Pendente') FOR [Estado]
GO
ALTER TABLE [dbo].[TimeTracking] ADD  DEFAULT (getdate()) FOR [DataRegisto]
GO
ALTER TABLE [dbo].[Utilizadores] ADD  CONSTRAINT [DF_Utilizadores_DataCriacao]  DEFAULT (getdate()) FOR [DataCriacao]
GO
ALTER TABLE [dbo].[Projectos]  WITH CHECK ADD  CONSTRAINT [FK_Projectos_Gestor] FOREIGN KEY([ID_Gestor])
REFERENCES [dbo].[Utilizadores] ([ID_Utilizador])
GO
ALTER TABLE [dbo].[Projectos] CHECK CONSTRAINT [FK_Projectos_Gestor]
GO
ALTER TABLE [dbo].[ProjectosProgramadores]  WITH CHECK ADD  CONSTRAINT [FK_ProjectosProgramadores_Programador] FOREIGN KEY([ID_Programador])
REFERENCES [dbo].[Utilizadores] ([ID_Utilizador])
GO
ALTER TABLE [dbo].[ProjectosProgramadores] CHECK CONSTRAINT [FK_ProjectosProgramadores_Programador]
GO
ALTER TABLE [dbo].[ProjectosProgramadores]  WITH CHECK ADD  CONSTRAINT [FK_ProjectosProgramadores_Projecto] FOREIGN KEY([ID_Projecto])
REFERENCES [dbo].[Projectos] ([ID_Projecto])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ProjectosProgramadores] CHECK CONSTRAINT [FK_ProjectosProgramadores_Projecto]
GO
ALTER TABLE [dbo].[Tarefas]  WITH CHECK ADD  CONSTRAINT [FK_Tarefas_Projecto] FOREIGN KEY([ID_Projecto])
REFERENCES [dbo].[Projectos] ([ID_Projecto])
GO
ALTER TABLE [dbo].[Tarefas] CHECK CONSTRAINT [FK_Tarefas_Projecto]
GO
ALTER TABLE [dbo].[Tarefas]  WITH CHECK ADD  CONSTRAINT [FK_Tarefas_Responsavel] FOREIGN KEY([ID_Responsavel])
REFERENCES [dbo].[Utilizadores] ([ID_Utilizador])
GO
ALTER TABLE [dbo].[Tarefas] CHECK CONSTRAINT [FK_Tarefas_Responsavel]
GO
ALTER TABLE [dbo].[TimeTracking]  WITH CHECK ADD  CONSTRAINT [FK_TimeTracking_Tarefa] FOREIGN KEY([ID_Tarefa])
REFERENCES [dbo].[Tarefas] ([ID_Tarefa])
GO
ALTER TABLE [dbo].[TimeTracking] CHECK CONSTRAINT [FK_TimeTracking_Tarefa]
GO
ALTER TABLE [dbo].[TimeTracking]  WITH CHECK ADD  CONSTRAINT [FK_TimeTracking_Utilizador] FOREIGN KEY([ID_Utilizador])
REFERENCES [dbo].[Utilizadores] ([ID_Utilizador])
GO
ALTER TABLE [dbo].[TimeTracking] CHECK CONSTRAINT [FK_TimeTracking_Utilizador]
GO
ALTER TABLE [dbo].[Utilizadores]  WITH CHECK ADD  CONSTRAINT [FK_Utilizadores_Tipo] FOREIGN KEY([ID_TipoUtilizador])
REFERENCES [dbo].[TiposUtilizador] ([ID_TipoUtilizador])
GO
ALTER TABLE [dbo].[Utilizadores] CHECK CONSTRAINT [FK_Utilizadores_Tipo]
GO
USE [master]
GO
ALTER DATABASE [IPNChallenge] SET  READ_WRITE 
GO
