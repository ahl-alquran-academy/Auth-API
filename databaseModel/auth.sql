-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema authdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema authdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `authdb` DEFAULT CHARACTER SET utf8 ;
USE `authdb` ;

-- -----------------------------------------------------
-- Table `authdb`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `authdb`.`User` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `UserName` VARCHAR(50) NOT NULL,
  `Telegram` VARCHAR(25) NOT NULL,
  `Email` VARCHAR(250) NOT NULL,
  `Password` VARCHAR(250) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE,
  UNIQUE INDEX `Telegram_UNIQUE` (`Telegram` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `authdb`.`Student`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `authdb`.`Student` (
  `RedFlag` INT NULL DEFAULT 0,
  `User_ID` INT NOT NULL,
  PRIMARY KEY (`User_ID`),
  INDEX `fk_Studen_User_idx` (`User_ID` ASC) VISIBLE,
  CONSTRAINT `fk_Studen_User`
    FOREIGN KEY (`User_ID`)
    REFERENCES `authdb`.`User` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `authdb`.`Sheikh`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `authdb`.`Sheikh` (
  `policy` VARCHAR(3) NOT NULL DEFAULT '010',
  `rate` DECIMAL(1,1) NOT NULL DEFAULT 0,
  `User_ID` INT NOT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `fk_Sheikh_User1`
    FOREIGN KEY (`User_ID`)
    REFERENCES `authdb`.`User` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
