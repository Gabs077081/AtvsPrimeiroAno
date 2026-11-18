create database bdEscola;
 
 use bdEscola;
 
 create table tbAluno(
 idAluno int primary key auto_increment,
 nomeAluno varchar (50),
 dataNascAluno date,
 estatoCivil varchar (20)
 );
 
 create table tbFoneAluno(
 idFoneAluno int primary key auto_increment,
 idAluno int,
 numeroFone varchar(14),
 foreign key (idAluno) references tbAluno(idAluno)
 );