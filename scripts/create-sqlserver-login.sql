-- Jalankan SEKALI sebagai administrator SQL Server (mis. lewat SSMS atau:
--   sqlcmd -S localhost -E -C -i scripts\create-sqlserver-login.sql
--
-- Prasyarat (dilakukan manual oleh Anda, memerlukan restart service SQL Server):
--   1. SQL Server Configuration Manager -> SQL Server Network Configuration
--      -> Protocols for MSSQLSERVER -> aktifkan TCP/IP (port 1433)
--   2. SSMS -> klik kanan server -> Properties -> Security
--      -> "SQL Server and Windows Authentication mode"
--   3. Restart service "SQL Server (MSSQLSERVER)"
--
-- GANTI password di bawah ini sebelum menjalankan.

IF DB_ID('polresta_batang') IS NULL CREATE DATABASE polresta_batang;
GO
IF SUSER_ID('polresta_app') IS NULL
  CREATE LOGIN polresta_app WITH PASSWORD = 'GantiPasswordKuat!2026', CHECK_POLICY = ON;
GO
USE polresta_batang;
GO
IF USER_ID('polresta_app') IS NULL CREATE USER polresta_app FOR LOGIN polresta_app;
GO
ALTER ROLE db_owner ADD MEMBER polresta_app;
GO
