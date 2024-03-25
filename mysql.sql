ALTER TABLE `hbrd_app_pet_vistoria`
ADD `ultimo_item_enviado` datetime NULL;

ALTER TABLE `hbrd_app_pet_vistoria_arquivo` 
CHANGE COLUMN `id` `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT ;

CREATE TABLE `hbrd_app_pet_termo` (
  `id_pet` int(10) unsigned NOT NULL,
  `assinatura` varchar(22) COLLATE utf8_bin DEFAULT NULL,
  `selfie` varchar(22) COLLATE utf8_bin DEFAULT NULL,
  `frente_doc` varchar(22) COLLATE utf8_bin DEFAULT NULL,
  `atras_doc` varchar(22) COLLATE utf8_bin DEFAULT NULL,
  `tipo_doc` enum('rg','cnh') COLLATE utf8_bin DEFAULT NULL,
  `lat` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `lng` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `id_contrato` int(10) unsigned DEFAULT NULL,
  `perguntas_contrato` json DEFAULT NULL,
  `contrato_tipo` enum('Manuscrito','Digital') COLLATE utf8_bin DEFAULT NULL,
  `status` enum('pendente','aprovada','reanalise') COLLATE utf8_bin DEFAULT NULL,
  `ip` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `dt_envio` datetime DEFAULT NULL,
  `doc_recusados` json DEFAULT NULL,
  `feito_em` enum('externo','app') COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id_pet`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


-- tabelas pet 

CREATE TABLE `hbrd_app_pet_exames` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_pet` int(10) unsigned NOT NULL,
  `id_agendamento` int(10) unsigned DEFAULT NULL,
  `clinica` varchar(60) DEFAULT NULL,
  `nome_medico` varchar(60) DEFAULT NULL,
  `nome` varchar(60) DEFAULT NULL,
  `data_hora` datetime DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` text,
  `status` enum('Pendente','Concluido','Cancelado') DEFAULT 'Pendente',
  `anexo` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1


CREATE TABLE `hbrd_app_pet_vacinas` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_pet` int(10) unsigned NOT NULL,
  `id_agendamento` int(10) unsigned DEFAULT NULL,
  `clinica` varchar(60) DEFAULT NULL,
  `nome` varchar(60) DEFAULT NULL,
  `aplicada` date DEFAULT NULL,
  `revacina` date DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1


CREATE TABLE `hbrd_app_pet_banhos` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_pet` int(10) unsigned NOT NULL,
  `id_agendamento` int(10) unsigned DEFAULT NULL,
  `clinica` varchar(60) DEFAULT NULL,
  `nome` varchar(60) DEFAULT NULL,
  `data_banho` datetime DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
	


CREATE TABLE `hbrd_app_pet_medicamentos` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_pet` int(10) unsigned NOT NULL,
  `id_agendamento` int(10) unsigned DEFAULT NULL,
  `nome` varchar(60) DEFAULT NULL,
  `dt_inicio` datetime DEFAULT NULL,
  `tratamento` varchar(100) DEFAULT NULL,
  `dosagem` varchar(100) DEFAULT NULL,
  `frequencia` varchar(100) DEFAULT NULL,
  `nome_medico` varchar(60) DEFAULT NULL,
  `instrucao` varchar(100) DEFAULT NULL,
  `validade` date DEFAULT NULL,
  `lote` varchar(45) DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `hbrd_app_pet_vermifugos` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_pet` int(10) unsigned NOT NULL,
  `id_agendamento` int(10) unsigned DEFAULT NULL,
  `nome` varchar(60) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `proxima_data` date DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1


  ALTER TABLE `hbrd_app_pet` 
  ADD COLUMN `idade` INT(2) NULL AFTER `peso`

-- alteração de tabelas (Gabriel)

ALTER TABLE `aupet`.`hbrd_app_pet_vacinas` 
DROP COLUMN `observacao`,
DROP COLUMN `nome`,
DROP COLUMN `clinica`,
ADD COLUMN `nome_medico` VARCHAR(455) NULL DEFAULT NULL AFTER `create_at`,
ADD COLUMN `crv_medico` VARCHAR(455) NULL DEFAULT NULL AFTER `nome_medico`,
CHANGE COLUMN `aplicada` `data_vacina` DATE NULL DEFAULT NULL ,
CHANGE COLUMN `revacina` `data_revacina` DATE NULL DEFAULT NULL ;

ALTER TABLE `aupet`.`hbrd_app_pet_vacinas` 
ADD COLUMN `nome_vacina` VARCHAR(455) NULL DEFAULT NULL AFTER `id_agendamento`;

ALTER TABLE `aupet`.`hbrd_app_pet_vermifugos` 
CHANGE COLUMN `nome` `nome_vermifungo` VARCHAR(60) NULL DEFAULT NULL ,
CHANGE COLUMN `data` `data_vermifungo` DATE NULL DEFAULT NULL ;

-- Criação de tabelas (06/04 - Gabriel)

CREATE TABLE `hbrd_app_pet_cirurgias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pet` int NOT NULL,
  `id_clinica` int unsigned NOT NULL,
  `descricao` varchar(100) DEFAULT NULL,
  `observacao` varchar(500) DEFAULT NULL,
  `data_hora` datetime NOT NULL,
  `data_agendamento` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_realizado` datetime DEFAULT NULL,
  `data_cancelado` datetime DEFAULT NULL,
  `id_motivo_cancelamento` int unsigned DEFAULT NULL,
  `status` enum('Pendente','Concluido','Cancelado') DEFAULT 'Pendente',
  `id_especialidade` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1

CREATE TABLE `hbrd_app_pet_internacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pet` int NOT NULL,
  `id_clinica` int unsigned NOT NULL,
  `id_especialidade` int DEFAULT NULL,
  `descricao` varchar(100) DEFAULT NULL,
  `observacao` varchar(500) DEFAULT NULL,
  `data_hora` datetime NOT NULL,
  `data_agendamento` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_entrada` datetime DEFAULT NULL,
  `data_saida` datetime DEFAULT NULL,
  `id_motivo_cancelamento` int unsigned DEFAULT NULL,
  `status` enum('Pendente','Concluido','Cancelado') DEFAULT 'Pendente',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1

ALTER TABLE `aupet`.`hbrd_app_pet_vacinas` 
ADD COLUMN `id_clinica` INT NULL DEFAULT NULL AFTER `id_agendamento`;

DROP TABLE IF EXISTS `hbrd_app_pet_exames`
CREATE TABLE `hbrd_app_pet_exames` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pet` int unsigned NOT NULL,
  `id_agendamento` int unsigned DEFAULT NULL,
  `id_clinica` int DEFAULT NULL,
  `clinica` varchar(60) DEFAULT NULL,
  `id_especialidade` int DEFAULT NULL,
  `nome_medico` varchar(60) DEFAULT NULL,
  `nome` varchar(60) DEFAULT NULL,
  `data` datetime DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` text,
  `status` enum('Pendente','Concluido','Cancelado') DEFAULT 'Pendente',
  `anexo` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1

DROP TABLE IF EXISTS `hbrd_app_pet_vacinas` 
CREATE TABLE `hbrd_app_pet_vacinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pet` int unsigned NOT NULL,
  `id_agendamento` int unsigned DEFAULT NULL,
  `id_clinica` int DEFAULT NULL,
  `id_especialidade` int DEFAULT NULL,
  `nome_vacina` varchar(455) DEFAULT NULL,
  `data_vacina` date DEFAULT NULL,
  `data_revacina` date DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `nome_medico` varchar(455) DEFAULT NULL,
  `crv_medico` varchar(455) DEFAULT NULL,
  `status` enum('Pendente','Concluido','Cancelado') DEFAULT 'Pendente',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1

-- 09/04 (Gabriel)

ALTER TABLE `aupet`.`hbrd_app_pet_exames` 
CHANGE COLUMN `status` `status` ENUM('Pendente', 'Agendado', 'Concluido', 'Cancelado') NULL DEFAULT 'Pendente' ;

ALTER TABLE `aupet`.`hbrd_app_pet_vacinas` 
CHANGE COLUMN `status` `status` ENUM('Pendente', 'Agendado', 'Concluido', 'Cancelado') NULL DEFAULT 'Pendente' ;

ALTER TABLE `aupet`.`hbrd_app_pet_cirurgias` 
CHANGE COLUMN `status` `status` ENUM('Pendente', 'Agendado', 'Concluido', 'Cancelado') NULL DEFAULT 'Pendente' ;

ALTER TABLE `aupet`.`hbrd_app_pet_internacoes` 
CHANGE COLUMN `status` `status` ENUM('Pendente', 'Agendado', 'Concluido', 'Cancelado') NULL DEFAULT 'Pendente' ;

ALTER TABLE `aupet`.`hbrd_app_pet_agendamento` 
CHANGE COLUMN `status` `status` ENUM('Pendente', 'Agendado', 'Concluido', 'Cancelado') NULL DEFAULT 'Pendente' ;

CREATE TABLE `hbrd_app_pessoa_pushtoken` (
  `id_pessoa` int(10) unsigned NOT NULL,
  `token` text COLLATE utf8_bin NOT NULL,
  `device` varchar(1000) COLLATE utf8_bin NOT NULL,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `plataforma` enum('web','app') COLLATE utf8_bin DEFAULT 'web',
  PRIMARY KEY (`device`,`id_pessoa`),
  KEY `fk_hbrd_app_pessoa_pushtoken_1_idx` (`id_pessoa`),
  CONSTRAINT `fk_hbrd_app_pessoa_pushtoken_1` FOREIGN KEY (`id_pessoa`) REFERENCES `hbrd_app_pessoa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin



-- 13/04/2021 tira a hora das tabelas e inserir toda data_time

ALTER TABLE `hbrd_app_pet_exames` 
DROP COLUMN `hora`;


ALTER TABLE `hbrd_app_pet_vacinas` 
DROP COLUMN `hora_vacina`,
CHANGE COLUMN `data_vacina` `data_vacina` DATETIME NULL DEFAULT NULL ,
CHANGE COLUMN `data_revacina` `data_revacina` DATETIME NULL DEFAULT NULL ;


ALTER TABLE `hbrd_app_pet_medicamentos` 
DROP COLUMN `hr_inicio`,
CHANGE COLUMN `dt_inicio` `dt_inicio` DATETIME NULL DEFAULT NULL ;

ALTER TABLE `hbrd_app_pet_vermifugos` 
CHANGE COLUMN `data_vermifungo` `data_vermifungo` DATETIME NULL DEFAULT NULL ,
CHANGE COLUMN `proxima_data` `proxima_data` DATETIME NULL DEFAULT NULL ;

-- Inclusão de coluna 'id_motivo_cancelamento' (Gabriel - 14/04)

ALTER TABLE `aupet`.`hbrd_app_pet_exames` 
ADD COLUMN `id_motivo_cancelamento` INT NULL DEFAULT NULL AFTER `observacao`;
ALTER TABLE `aupet`.`hbrd_app_pet_exames` 
ADD COLUMN `data_cancelado` DATETIME NULL DEFAULT NULL AFTER `id_motivo_cancelamento`;


ALTER TABLE `aupet`.`hbrd_app_pet_vacinas` 
ADD COLUMN `id_motivo_cancelamento` INT NULL DEFAULT NULL AFTER `status`;
ALTER TABLE `aupet`.`hbrd_app_pet_vacinas` 
ADD COLUMN `data_cancelado` DATETIME NULL DEFAULT NULL AFTER `id_motivo_cancelamento`;



-- 14/04/2021 

ALTER TABLE `hbrd_app_clinica` 
ADD COLUMN `logo` VARCHAR(500) NULL AFTER `observacao`;

ALTER TABLE `hbrd_app_pet` 
ADD COLUMN `bonificacao` DECIMAL(8,2) NULL AFTER `arquivado_em`;


-- 16/04/2021
ALTER TABLE `hbrd_app_pet_exames` 
ADD COLUMN `crv_medico` VARCHAR(60) NULL AFTER `nome_medico`;

ALTER TABLE `hbrd_app_pet_internacoes` 
ADD COLUMN `nome_medico` VARCHAR(60) NULL AFTER `status`,
ADD COLUMN `crv_medico` VARCHAR(60) NULL AFTER `nome_medico`;

ALTER TABLE `hbrd_app_pet_cirurgias` 
ADD COLUMN `nome_medico` VARCHAR(60) NULL AFTER `id_especialidade`,
ADD COLUMN `crv_medico` VARCHAR(60) NULL AFTER `nome_medico`;

ALTER TABLE `hbrd_app_pet_agendamento` 
ADD COLUMN `nome_medico` VARCHAR(60) NULL AFTER `id_motivo_cancelamento`,
ADD COLUMN `crv_medico` VARCHAR(60) NULL AFTER `nome_medico`;

-- 04/05/2021 (Gabriel)

CREATE TABLE `hbrd_app_doacoes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_pessoa` int unsigned NOT NULL,
  `id_ong` int unsigned NOT NULL,
  `valor` float unsigned NOT NULL,
  `id_pagamento` int unsigned NOT NULL,
  `status_pagamento` varchar(45) NOT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1

CREATE TABLE `hbrd_app_pagamentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_pessoa` int unsigned NOT NULL,
  `id_plano` int unsigned NOT NULL,
  `valor` float unsigned NOT NULL,
  `id_pagamento` int unsigned NOT NULL,
  `status_pagamento` varchar(45) NOT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1

--06/05/2021

ALTER TABLE `aupet`.`hbrd_app_doacoes` 
ADD COLUMN `nome_doador` VARCHAR(100) NULL AFTER `tipo`,
ADD COLUMN `cpf_doador` VARCHAR(20) NULL AFTER `nome_doador`,
ADD COLUMN `email_doador` VARCHAR(60) NULL AFTER `cpf_doador`,
ADD COLUMN `telefone_doador` VARCHAR(45) NULL AFTER `email_doador`;


--07/05/2021 
ALTER TABLE `aupet`.`hbrd_app_doacoes` 
ADD COLUMN `id_campanha` INT(10) UNSIGNED NULL AFTER `id_ong`;


CREATE TABLE `aupet`.`hbrd_app_pet_mensalidades` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `id_pet` INT(11) UNSIGNED NOT NULL,
  `mes` INT(2) NOT NULL,
  `ano` INT(4) NOT NULL,
  `id_pagamento` INT(10) UNSIGNED NULL,
  `valor` FLOAT NOT NULL,
  PRIMARY KEY (`id`));


  -- AJUSTE DE TABELAS 11/05/2021
CREATE TABLE `hbrd_app_pet_mensalidades` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_pet` int(11) unsigned NOT NULL,
  `id_assinatura` int(10) unsigned DEFAULT NULL,
  `valor` float NOT NULL,
  `data_fatura` datetime DEFAULT NULL,
  `status` enum('aberta','fechada') DEFAULT 'aberta',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1

CREATE TABLE `hbrd_app_pet_assinatura` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `id_pet` INT(10) unsigned NOT NULL ,
  `assinatura` VARCHAR(500) NOT NULL,
  `card` VARCHAR(60) NOT NULL,
  `application_id` VARCHAR(45) NULL,
  `status` VARCHAR(45) NULL,
  `payment_method_id` VARCHAR(45) NULL,
  `card_mes` VARCHAR(5) NULL,
  `card_ano` VARCHAR(4) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `assinatura_UNIQUE` (`assinatura` ASC));

  ALTER TABLE 'hbrd_app_pet'
  ADD COLUMN `id_assinatura` int(10) unsigned DEFAULT NULL,

    -- AJUSTE DE TABELAS 12/05/2021

  ALTER TABLE `aupet`.`hbrd_app_pet_mensalidades` 
  DROP COLUMN `id_assinatura`;


ALTER TABLE `aupet`.`hbrd_app_pet_assinatura` 
ADD COLUMN `user_id` VARCHAR(60) NULL AFTER `id_pet`;

ALTER TABLE `aupet`.`hbrd_app_pet_mensalidades` 
CHANGE COLUMN `id_pet` `id_associado` INT(11) UNSIGNED NOT NULL , RENAME TO  `aupet`.`hbrd_app_mensalidades` ;

    -- AJUSTE DE TABELAS 12/05/2021
ALTER TABLE `aupet`.`hbrd_app_mensalidades` 
ADD COLUMN `id_mensalidade` VARCHAR(455) NULL AFTER `id_associado`;

    -- AJUSTE DE TABELAS 25/05/2021
ALTER TABLE `aupet`.`hbrd_app_pet_vacinas` 
ADD COLUMN `id_motivo_cancelamento` INT(10) NULL DEFAULT NULL AFTER `status`;
ADD COLUMN `data_cancelado` DATETIME NULL DEFAULT NULL AFTER `id_motivo_cancelamento`;

  -- Gabriel(27/10/2021)

ALTER TABLE `aupethei_aupet2021`.`hbrd_app_assinatura` 
ADD COLUMN `cancelado_em` DATETIME NULL DEFAULT NULL AFTER `descricao`,
ADD COLUMN `id_arquivamento` TINYINT(1) NULL DEFAULT NULL AFTER `cancelado_em`;

ALTER TABLE `aupethei_aupet2021`.`hbrd_app_assinatura` 
CHANGE COLUMN `payment_method_id` `payment_method_id` VARCHAR(45) NULL DEFAULT NULL AFTER `application_id`,
ADD COLUMN `external_reference` VARCHAR(455) NULL DEFAULT NULL AFTER `status`;



