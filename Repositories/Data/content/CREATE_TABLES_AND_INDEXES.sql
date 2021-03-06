IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('USDA_NUT_DATA'))
BEGIN
	DROP TABLE USDA_NUT_DATA;
END;

IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('USDA_NUTR_DEF'))
BEGIN
	DROP TABLE USDA_NUTR_DEF;
END;

IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('USDA_WEIGHT'))
BEGIN
	DROP TABLE USDA_WEIGHT;
END;

IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('USDA_FOOD_DES'))
BEGIN
	DROP TABLE USDA_FOOD_DES;
END;

IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('USDA_FD_GROUP'))
BEGIN
	DROP TABLE USDA_FD_GROUP;
END;

IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('NUT_HISTORY'))
BEGIN
	DROP TABLE NUT_HISTORY;
END;

IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('NUT_PROFILE'))
BEGIN
	DROP TABLE NUT_PROFILE;
END;

IF EXISTS(
	SELECT * 
	FROM SYS.OBJECTS 
	WHERE OBJECT_ID = OBJECT_ID('NUT_USER'))
BEGIN
	DROP TABLE NUT_USER;
END;

CREATE TABLE USDA_FD_GROUP(
	FdGrp_Cd DECIMAL(4,0) PRIMARY KEY,
	FdGrp_Desc NVARCHAR(60) NOT NULL,
);

CREATE TABLE USDA_FOOD_DES(
	NDB_No DECIMAL(5,0) PRIMARY KEY,
	FdGrp_Cd DECIMAL(4,0) NOT NULL,
	Long_Desc NVARCHAR(200) NOT NULL,
	Shrt_Desc NVARCHAR(60) NOT NULL,
	ComName NVARCHAR(100),
	ManufacName NVARCHAR(65),
	Survey NVARCHAR(1),
	Ref_desc NVARCHAR(135),
	Refuse DECIMAL(2,0),
	SciName NVARCHAR(65),
	N_Factor DECIMAL(4,2),
	Pro_Factor DECIMAL(4,2),
	Fat_Factor DECIMAL(4,2),
	CHO_Factor DECIMAL(4,2),
	CONSTRAINT FOOD_DES_FD_GROUP_Fk FOREIGN KEY(FdGrp_Cd) REFERENCES USDA_FD_GROUP(FdGrp_Cd)
);

CREATE NONCLUSTERED INDEX Idx_FOOD_DES_FdGrp_Cd ON USDA_FOOD_DES(FdGrp_Cd);

CREATE TABLE USDA_WEIGHT(
	NDB_No DECIMAL(5,0) NOT NULL,  
	Seq DECIMAL(2,0) NOT NULL, 
	Amount DECIMAL(5,3) NOT NULL, 
	Msre_Desc NVARCHAR(84) NOT NULL, 
	Gm_Wgt DECIMAL(7,1) NOT NULL, 
	Num_Data_Pts DECIMAL(3,0), 
	Std_Dev DECIMAL(7,1),
	PRIMARY KEY(NDB_No, Seq),
	CONSTRAINT WEIGHT_FOOD_DES_Fk FOREIGN KEY(NDB_No) REFERENCES USDA_FOOD_DES(NDB_No)
);

CREATE TABLE USDA_NUTR_DEF(
	Nutr_No DECIMAL(3,0) PRIMARY KEY, 
	Units NVARCHAR(7) NOT NULL,
	Tagname NVARCHAR(20), 
	NutrDesc NVARCHAR(60) NOT NULL, 
	Num_Dec DECIMAL(1,0) NOT NULL, 
	SR_Order DECIMAL(6,0)NOT NULL,
);

CREATE TABLE USDA_NUT_DATA(
	NDB_No DECIMAL(5,0) NOT NULL, 
	Nutr_No DECIMAL(3,0) NOT NULL, 
	Nutr_Val DECIMAL(10,3) NOT NULL,
	Num_Data_Pts DECIMAL(5,0)NOT NULL,
	Std_Error DECIMAL(8,3),
	Src_Cd NVARCHAR(2) NOT NULL,
	Deriv_Cd NVARCHAR(4),
	Ref_NDB_No NVARCHAR(5),
	Add_Nutr_Mark NVARCHAR(1),
	Num_Studies DECIMAL(2,0),
	[Min] DECIMAL(10,3),
	[Max] DECIMAL(10,3),
	DF NVARCHAR(10),
	Low_EB DECIMAL(10,3),
	Up_EB DECIMAL(10,3),
	Stat_cmt NVARCHAR(10),
	AddMod_Date NVARCHAR(10),
	CC NVARCHAR(1),	
	PRIMARY KEY(NDB_No, Nutr_No),
	CONSTRAINT NUT_DATA_FOOD_DES_Fk FOREIGN KEY(NDB_No) REFERENCES USDA_FOOD_DES(NDB_No),
	CONSTRAINT NUT_DATA_NUTR_DEF_Fk FOREIGN KEY(Nutr_No) REFERENCES USDA_NUTR_DEF(Nutr_No),
);

CREATE TABLE NUT_USER(
	USER_No DECIMAL(5,0) IDENTITY(1000,1) PRIMARY KEY,
	FirstName NVARCHAR(160) NOT NULL,
	LastName NVARCHAR(160) NOT NULL,
);

CREATE TABLE NUT_HISTORY(
	Id DECIMAL(5,0) IDENTITY(1000,1) PRIMARY KEY,
	USER_No DECIMAL(5,0) NOT NULL,
	NDB_No DECIMAL(5,0) NOT NULL,
	Seq DECIMAL(2,0) NOT NULL,
	Food_Amount DECIMAL (10,2) NOT NULL, 
	Meal_Calorie DECIMAL(10,2) NOT NULL,
	Meal_Time  NVARCHAR(10) NOT NULL,
	Add_Date NVARCHAR(10) NOT NULL,
	CONSTRAINT NUT_HISTORY_NUT_USER_Fk FOREIGN KEY(USER_No) REFERENCES NUT_USER(USER_No),
	CONSTRAINT NUT_HISTORY_FOOD_DES_Fk FOREIGN KEY(NDB_No) REFERENCES USDA_FOOD_DES(NDB_No)
);

CREATE NONCLUSTERED INDEX Idx_NUT_HISTORY_USER_No ON NUT_HISTORY(USER_No);
CREATE NONCLUSTERED INDEX Idx_NUT_HISTORY_NDB_No ON NUT_HISTORY(NDB_No);
CREATE NONCLUSTERED INDEX Idx_NUT_HISTORY_Meal_Calorie ON NUT_HISTORY(Meal_Calorie);
CREATE NONCLUSTERED INDEX Idx_NUT_HISTORY_Add_Date ON NUT_HISTORY(Add_Date);

CREATE TABLE NUT_PROFILE(
	Id DECIMAL(5,0) IDENTITY(1000,1) PRIMARY KEY,
	USER_No DECIMAL(5,0) NOT NULL,
	Gender NVARCHAR(10) NOT NULL,  
	Height DECIMAL(10,2) NOT NULL,
	HeightUnit NVARCHAR(10) NOT NULL,  
	Weight DECIMAL(10,2) NOT NULL,
	WeightUnit NVARCHAR(10) NOT NULL, 
	Age DECIMAL(4,0) NOT NULL, 
	Calc_Calorie DECIMAL(10,2) NOT NULL,
	Expc_Calorie DECIMAL(10,2) NOT NULL,
	BMR DECIMAL(10,2) NOT NULL,
	BMI DECIMAL(10,2) NOT NULL,
	Activity DECIMAL(4,2) NOT NULL,
	Add_Date NVARCHAR(10) NOT NULL,
	CONSTRAINT NUT_Profile_USER_Fk FOREIGN KEY(USER_No) REFERENCES NUT_USER(USER_No),
);

CREATE NONCLUSTERED INDEX Idx_NUT_PROFILE_USER_No ON NUT_Profile(USER_No);
CREATE NONCLUSTERED INDEX Idx_NUT_PROFILE_Calc_Calorie ON NUT_Profile(Calc_Calorie);
CREATE NONCLUSTERED INDEX Idx_NUT_PROFILE_Expc_Calorie ON NUT_Profile(Expc_Calorie);
CREATE NONCLUSTERED INDEX Idx_NUT_PROFILE_Add_Date ON NUT_Profile(Add_Date);




--CREATE NONCLUSTERED INDEX Idx_VISIT_PHY_ID ON VISIT(PHY_ID);
--CREATE NONCLUSTERED INDEX Idx_VISIT_PT_ID ON VISIT(PT_ID);
--CREATE NONCLUSTERED INDEX Idx_VISIT_BUILD_ID ON VISIT(BUILD_ID);
--CREATE NONCLUSTERED INDEX Idx_VISIT_DATE ON VISIT(VISIT_DATE);
--CREATE NONCLUSTERED INDEX Idx_REG_ZIP_CODE ON [ADDRESS](REG_ZIP_CODE);

--CREATE TABLE CONTACT(
--	CONT_ID INT IDENTITY(1000,1) PRIMARY KEY,
--	ADDR_ID INT,
--	CONT_PHONE NVARCHAR(150),
--	CONSTRAINT Contact_Address_Fk FOREIGN KEY(ADDR_ID) REFERENCES [ADDRESS](ADDR_ID),
--);

--CREATE NONCLUSTERED INDEX Idx_CONTACT_ADDR_ID ON CONTACT(ADDR_ID);

--CREATE TABLE FIND(
--	CONT_ID INT,
--	PT_ID INT,
--	PRIMARY KEY(CONT_ID, PT_ID),
--	CONSTRAINT Find_Contact_Fk FOREIGN KEY(CONT_ID) REFERENCES CONTACT(CONT_ID),
--	CONSTRAINT Find_Patient_Fk FOREIGN KEY(PT_ID) REFERENCES PATIENT(PT_ID)
--);

