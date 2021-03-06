drop schema toh;

create schema toh;

use toh;

create table account (
	id bigint not null auto_increment, 
	username varchar(128), 
	password varchar(128), 
	accountKey varchar(128),
	signupdate varchar(32),
	status enum('confirmationAwaiting', 'active', 'deleted') NOT NULL DEFAULT 'confirmationAwaiting',
	PRIMARY KEY(id)
);

CREATE TABLE profile (
	account_id bigint not null,
	accountType enum('private', 'corporate') NOT NULL DEFAULT 'private', 
	imagePath varchar(256),
	name varchar(128), 
	corporation varchar(128),
	corpID varchar(64),
	familyname varchar(128), 
	phone varchar(20), 
	street varchar(128), 
	city varchar(128), 
	postalcode int, 
	dob varchar(64), 
	gender varchar(10) null, 
	occupation varchar(128) null, 
	allergy varchar(128) null, 
	responsiblePerson varchar(128) null, 
	PRIMARY KEY(account_id),
	FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

CREATE TABLE ads (
	id BIGINT NOT NULL AUTO_INCREMENT,
	account_id BIGINT NOT NULL,
	adType enum('letting', 'renting') NOT NULL,
	payment_receipt varchar(128),
	adStatus enum('paymentAwaited', 'open', 'matched', 'closed') NOT NULL default 'paymentAwaited',
	PRIMARY KEY(id),
	FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);
	
CREATE TABLE letting (
	id BIGINT NOT NULL,
	account_id BIGINT NOT NULL,
	state varchar(128),
	municipality varchar(128),
	area varchar(128),
	accessDate BIGINT,
	duration varchar(64),
	accommodationType enum('any', 'rentalApartment', 'studentApartment', 'studentRoom', 'room', 'house', 'cottage') NOT NULL default 'any',
	minSize int,
	minRooms int,
	contract enum('any', 'primarily', 'sublease', 'other') NOT NULL default 'any',
	balcony enum('any', 'yes', 'no') NOT NULL default 'any',
	furnished enum('any', 'yes', 'no') NOT NULL default 'any',
	floor enum('any', 'basement', 'groundFloor', 'aboveGround') NOT NULL default 'any',
	elevator enum('any', 'yes', 'no') NOT NULL default 'any',
	maxPrice int,
	period enum('any', 'day', 'week', 'month') NOT NULL default 'any',
	aboutMe varchar(256),
	creationtime bigint,
	lastupdatedtime bigint,
	PRIMARY KEY(id),
	FOREIGN KEY (id) REFERENCES ads(id) ON DELETE CASCADE,
	FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

CREATE TABLE renting (
	id BIGINT NOT NULL,
	account_id BIGINT NOT NULL,
	state varchar(128),
	municipality varchar(128),
	area varchar(128),
	accessDate BIGINT,
	minTimeToRent varchar(64),
	accommodationType enum('rentalApartment', 'studentApartment', 'studentRoom', 'room', 'house', 'cottage') NOT NULL,
	size int,
	numOfRooms int,
	contract enum('primarily', 'sublease', 'other'),
	balcony enum('yes', 'no'),
	furnished enum('yes', 'no'),
	floor enum('basement', 'groundFloor', 'aboveGround'),
	elevator enum('yes', 'no'),
	price int,
	period enum('day', 'week', 'month'),
	moreInfo varchar(256),
	forWhom enum('any', 'private', 'corporation') NOT NULL default 'any',
	gender enum('any', 'man', 'woman') NOT NULL default 'any',
	creationtime bigint,
	lastupdatedtime bigint,
	PRIMARY KEY(id),
	FOREIGN KEY (id) REFERENCES ads(id) ON DELETE CASCADE,
	FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

CREATE TABLE renting_ad_images (
	renting_ad_id BIGINT NOT NULL,
	field_name varchar(32),
	image_path varchar(256),
	PRIMARY KEY(renting_ad_id, field_name),
	FOREIGN KEY (renting_ad_id) REFERENCES renting(id) ON DELETE CASCADE
);

CREATE TABLE matchedAds (
	renting_account_id BIGINT NOT NULL,
	renting_ad_id BIGINT NOT NULL,
	letting_account_id BIGINT NOT NULL,
	letting_ad_id BIGINT NOT NULL,
	matched_time BIGINT,
	last_updated_time BIGINT,
	close_time BIGINT,
	status enum('awaiting','renterAccepted', 'letterAccepted', 'renterDenied', 'letterDenied', 'autoDenied', 'approved') NOT NULL default 'awaiting',
	PRIMARY KEY(renting_ad_id, letting_ad_id),
	FOREIGN KEY (renting_account_id) REFERENCES account(id) ON DELETE CASCADE,
	FOREIGN KEY (renting_ad_id) REFERENCES renting(id) ON DELETE CASCADE,
	FOREIGN KEY (letting_account_id) REFERENCES account(id) ON DELETE CASCADE,
	FOREIGN KEY (letting_ad_id) REFERENCES letting(id) ON DELETE CASCADE
);